import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { ChemicalSample } from './entities/chemical-sample.entity';
import { SampleLike } from './entities/sample-like.entity';

@Injectable()
export class ChemicalSamplesService {
  constructor(
    @InjectRepository(ChemicalSample)
    private readonly sampleRepo: Repository<ChemicalSample>,
    @InjectRepository(SampleLike)
    private readonly likeRepo: Repository<SampleLike>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── GET: Плитка (published + draft, без deleted) ───
  async findAllForTile(gasVolume?: number) {
    const qb = this.sampleRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.likes', 'l')
      .where('s.status != :deleted', { deleted: 'deleted' });

    if (gasVolume !== undefined && gasVolume !== null) {
      qb.andWhere('s.gas_volume = :vol', { vol: gasVolume });
    }

    qb.orderBy('s.id', 'ASC');

    const entities = await qb.getMany();

    return entities.map((entity) => ({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      image_url: entity.image_url,
      video_url: entity.video_url,
      impurities_percent: entity.impurities_percent,
      gas_volume: entity.gas_volume,
      likes: entity.likes ? entity.likes.length : 0,
      isDraft: entity.status === 'draft',
    }));
  }

  // ─── GET: Черновик текущего пользователя ───
  async findDraftByUser(userId: number) {
    return this.sampleRepo.findOne({
      where: { creator_id: userId, status: 'draft' },
    });
  }

  // ─── GET: Лента (только published, строго 1 строка из БД) ───
  async findOneForFeed(id?: number, next?: boolean) {
    const qb = this.sampleRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.likes', 'l')
      .where('s.status = :status', { status: 'published' })
      .orderBy('s.id', 'ASC')
      .limit(1);

    if (id && next) {
      qb.andWhere('s.id > :id', { id });
    } else if (id && !next) {
      qb.andWhere('s.id = :id', { id });
    }

    let entities = await qb.getMany();

    // Если нажали "Далее" и дошли до конца — начинаем сначала (Wrap around)
    if (entities.length === 0 && id && next) {
      entities = await this.sampleRepo.createQueryBuilder('s')
        .leftJoinAndSelect('s.likes', 'l')
        .where('s.status = :status', { status: 'published' })
        .orderBy('s.id', 'ASC')
        .limit(1)
        .getMany();
    }

    if (entities.length === 0) {
      return null;
    }

    const entity = entities[0];
    const likesCount = entity.likes ? entity.likes.length : 0;

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      image_url: entity.image_url,
      video_url: entity.video_url,
      impurities_percent: entity.impurities_percent,
      gas_volume: entity.gas_volume,
      likes: likesCount,
    };
  }

  // ─── POST: Создание черновика (ORM) ───
  async createDraft(userId: number, title: string) {
    const sample = this.sampleRepo.create({
      title,
      status: 'draft',
      creator_id: userId,
      created_at: new Date(),
    });
    return this.sampleRepo.save(sample);
  }

  // ─── POST: Публикация черновика (ORM) ───
  async publishDraft(
    userId: number,
    title: string,
    description: string,
    impuritiesPercent: number,
    gasVolume: number,
  ) {
    const draft = await this.sampleRepo.findOne({
      where: { creator_id: userId, status: 'draft' },
    });

    if (!draft) {
      return null;
    }

    if (title) {
      draft.title = title;
    }
    draft.description = description;
    draft.impurities_percent = impuritiesPercent;
    draft.gas_volume = gasVolume;
    draft.status = 'published';
    draft.formation_date = new Date();

    return this.sampleRepo.save(draft);
  }

  // ─── POST: Логическое удаление через raw SQL (без ORM) с использованием курсора ───
  async deleteSampleRaw(sampleId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`DECLARE delete_cursor CURSOR FOR SELECT id FROM chemical_samples WHERE id = $1 AND status != 'deleted' FOR UPDATE`, [sampleId]);
      await queryRunner.query(`FETCH NEXT FROM delete_cursor`);
      await queryRunner.query(`UPDATE chemical_samples SET status = 'deleted' WHERE CURRENT OF delete_cursor`);
      await queryRunner.query(`CLOSE delete_cursor`);
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
