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
      .leftJoin('s.likes', 'l')
      .addSelect('COUNT(l.id)', 'likes_count')
      .where('s.status != :deleted', { deleted: 'deleted' })
      .groupBy('s.id');

    if (gasVolume !== undefined && gasVolume !== null) {
      qb.andWhere('s.gas_volume = :vol', { vol: gasVolume });
    }

    qb.orderBy('s.id', 'ASC');

    const raw = await qb.getRawAndEntities();

    return raw.entities.map((entity, i) => ({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      image_url: entity.image_url,
      video_url: entity.video_url,
      impurities_percent: entity.impurities_percent,
      gas_volume: entity.gas_volume,
      likes: parseInt(raw.raw[i].likes_count, 10) || 0,
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
      .leftJoin('s.likes', 'l')
      .addSelect('COUNT(l.id)', 'likes_count')
      .where('s.status = :status', { status: 'published' })
      .groupBy('s.id')
      .orderBy('s.id', 'ASC')
      .limit(1);

    if (id && next) {
      qb.andWhere('s.id > :id', { id });
    } else if (id && !next) {
      qb.andWhere('s.id = :id', { id });
    }

    let rawAndEntities = await qb.getRawAndEntities();

    // Если нажали "Далее" и дошли до конца — начинаем сначала (Wrap around)
    if (rawAndEntities.entities.length === 0 && id && next) {
      rawAndEntities = await this.sampleRepo.createQueryBuilder('s')
        .leftJoin('s.likes', 'l')
        .addSelect('COUNT(l.id)', 'likes_count')
        .where('s.status = :status', { status: 'published' })
        .groupBy('s.id')
        .orderBy('s.id', 'ASC')
        .limit(1)
        .getRawAndEntities();
    }

    if (rawAndEntities.entities.length === 0) {
      return null;
    }

    const entity = rawAndEntities.entities[0];
    const likesCount = parseInt(rawAndEntities.raw[0].likes_count, 10) || 0;

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

  // ─── POST: Логическое удаление через raw SQL (без ORM) ───
  async deleteSampleRaw(sampleId: number) {
    const query = `UPDATE chemical_samples SET status = 'deleted' WHERE id = $1 AND status != 'deleted'`;
    const result = await this.dataSource.query(query, [sampleId]);
    return result;
  }
}
