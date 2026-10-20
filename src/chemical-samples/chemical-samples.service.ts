import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client as MinioClient } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ChemicalSample } from './entities/chemical-sample.entity';
import { SampleLike } from './entities/sample-like.entity';
import { User } from './entities/user.entity';

@Injectable()
export class ChemicalSamplesService {
  private readonly minio: MinioClient;
  private readonly bucket = 'chemistry1';

  constructor(
    @InjectRepository(ChemicalSample)
    private readonly sampleRepo: Repository<ChemicalSample>,
    @InjectRepository(SampleLike)
    private readonly likeRepo: Repository<SampleLike>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {
    this.minio = new MinioClient({
      endPoint: '127.0.0.1',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
    });
  }

  // ─── GET: Список опубликованных с опциональной фильтрацией ───
  // Доступен БЕЗ авторизации (гость). Если передан userId, рассчитываются признаки 0/1.
  async findAll(currentUserId?: number, gasVolume?: number) {
    const qb = this.sampleRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.likes', 'l')
      .where('s.status = :status', { status: 'published' });

    if (gasVolume !== undefined && gasVolume !== null && !isNaN(gasVolume)) {
      qb.andWhere('s.gas_volume = :vol', { vol: gasVolume });
    }

    qb.orderBy('s.id', 'ASC');
    const entities = await qb.getMany();

    return entities.map((e) => this.serializeSample(e, currentUserId));
  }

  // ─── GET: Лента (только published, по одной карточке) ───
  // Доступен БЕЗ авторизации (гость) с закольцовыванием
  async findFeed(currentUserId?: number, id?: number, next?: boolean) {
    const qb = this.sampleRepo
      .createQueryBuilder('s')
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

    // Закольцовывание: если дошли до конца списка — отдаем первую запись
    if (entities.length === 0 && id && next) {
      entities = await this.sampleRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.likes', 'l')
        .where('s.status = :status', { status: 'published' })
        .orderBy('s.id', 'ASC')
        .limit(1)
        .getMany();
    }

    if (entities.length === 0) return null;
    return this.serializeSample(entities[0], currentUserId);
  }

  // ─── GET: Один опубликованный образец по ID ───
  async findOne(currentUserId?: number, id?: number) {
    if (!id) throw new BadRequestException('ID образца обязателен');
    const sample = await this.sampleRepo.findOne({
      where: { id, status: 'published' },
      relations: { likes: true },
    });
    if (!sample) {
      throw new NotFoundException(`Опубликованный образец с ID ${id} не найден`);
    }
    return this.serializeSample(sample, currentUserId);
  }

  // ─── GET: Черновик текущего пользователя ───
  // Требует авторизации (только для создателя)
  async findDraft(currentUserId: number) {
    const entity = await this.sampleRepo.findOne({
      where: { creator_id: currentUserId, status: 'draft' },
      relations: { likes: true },
    });
    if (!entity) return null;
    return this.serializeSample(entity, currentUserId);
  }

  // ─── POST: Создание черновика + автозаполнение автора из сессии ───
  // Требует авторизации (только для создателя).
  // creator_id АВТОМАТИЧЕСКИ заполняется из currentUserId!
  async createDraft(
    currentUserId: number,
    title: string,
    imageFile?: any,
    videoFile?: any,
  ) {
    if (!title || !title.trim()) {
      throw new BadRequestException('Название образца (поле "title") обязательно');
    }
    if (!imageFile || !imageFile.buffer) {
      throw new BadRequestException('Необходимо выбрать файл изображения (поле "image")');
    }
    if (!videoFile || !videoFile.buffer) {
      throw new BadRequestException('Необходимо выбрать файл видео (поле "video")');
    }

    // Проверка: не более 1 черновика для одного пользователя
    const existingDraft = await this.sampleRepo.findOne({
      where: { creator_id: currentUserId, status: 'draft' },
    });
    if (existingDraft) {
      throw new BadRequestException(
        `У вас уже есть незавершённый черновик (ID: ${existingDraft.id}). Опубликуйте или удалите текущий черновик перед созданием нового.`,
      );
    }

    // Проверка/создание бакета в MinIO S3
    try {
      const bucketExists = await this.minio.bucketExists(this.bucket);
      if (!bucketExists) {
        await this.minio.makeBucket(this.bucket, 'us-east-1');
      }
    } catch {
      // Игнорируем ошибку при повторном существовании
    }

    // Генерация уникальных имён файлов на латинице (UUID)
    const imageExt = path.extname(imageFile.originalname) || '.jpg';
    const videoExt = path.extname(videoFile.originalname) || '.mp4';
    const imageFilename = `img_${uuidv4()}${imageExt}`;
    const videoFilename = `vid_${uuidv4()}${videoExt}`;

    await this.minio.putObject(
      this.bucket,
      imageFilename,
      imageFile.buffer,
      imageFile.size,
      { 'Content-Type': imageFile.mimetype || 'image/jpeg' },
    );

    await this.minio.putObject(
      this.bucket,
      videoFilename,
      videoFile.buffer,
      videoFile.size,
      { 'Content-Type': videoFile.mimetype || 'video/mp4' },
    );

    const imageUrl = `http://127.0.0.1:9000/${this.bucket}/${imageFilename}`;
    const videoUrl = `http://127.0.0.1:9000/${this.bucket}/${videoFilename}`;

    // Автозаполнение создателя: creator_id = currentUserId
    const sample = this.sampleRepo.create({
      title: title.trim(),
      status: 'draft',
      creator_id: currentUserId,
      created_at: new Date(),
      image_url: imageUrl,
      video_url: videoUrl,
    });

    const saved = await this.sampleRepo.save(sample);
    saved.likes = [];
    return this.serializeSample(saved, currentUserId);
  }

  // ─── PUT: Публикация черновика создателя ───
  // Требует авторизации (только для создателя)
  async publishDraft(
    currentUserId: number,
    title?: string,
    description?: string,
    impuritiesPercent?: number,
    gasVolume?: number,
  ) {
    const draft = await this.sampleRepo.findOne({
      where: { creator_id: currentUserId, status: 'draft' },
      relations: { likes: true },
    });

    if (!draft) {
      throw new NotFoundException('Активный черновик текущего пользователя не найден');
    }

    if (title && title.trim()) draft.title = title.trim();
    if (description !== undefined && description !== null) draft.description = description;
    if (impuritiesPercent !== undefined && impuritiesPercent !== null && !isNaN(impuritiesPercent)) {
      draft.impurities_percent = impuritiesPercent;
    }
    if (gasVolume !== undefined && gasVolume !== null && !isNaN(gasVolume)) {
      draft.gas_volume = gasVolume;
    }

    // Системные поля — фиксируются сервером
    draft.status = 'published';
    draft.formation_date = new Date();

    const saved = await this.sampleRepo.save(draft);
    return this.serializeSample(saved, currentUserId);
  }

  // ─── DELETE: Soft delete через курсор SQL (только для автора) ───
  // Требует авторизации: удалять разрешено только образцы текущего создателя
  async deleteSample(currentUserId: number, sampleId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(
        `DECLARE delete_cursor CURSOR FOR SELECT id FROM chemical_samples WHERE id = $1 AND creator_id = $2 AND status != 'deleted' FOR UPDATE`,
        [sampleId, currentUserId],
      );
      const fetched = await queryRunner.query(`FETCH NEXT FROM delete_cursor`);
      if (!fetched || fetched.length === 0) {
        await queryRunner.query(`CLOSE delete_cursor`);
        await queryRunner.rollbackTransaction();
        throw new NotFoundException(
          'Образец не найден, уже удалён или принадлежит другому создателю',
        );
      }
      await queryRunner.query(
        `UPDATE chemical_samples SET status = 'deleted' WHERE CURRENT OF delete_cursor`,
      );
      await queryRunner.query(`CLOSE delete_cursor`);
      await queryRunner.commitTransaction();
      return { message: 'Образец успешно удалён (soft delete)', id: sampleId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── POST: Лайк / отмена лайка (только для авторизованного пользователя) ───
  async toggleLike(currentUserId: number, sampleId: number, value: number) {
    const sample = await this.sampleRepo.findOne({
      where: { id: sampleId, status: 'published' },
    });
    if (!sample) throw new NotFoundException('Опубликованный образец не найден');

    if (value !== 0 && value !== 1) {
      throw new BadRequestException(
        'Поле "value" должно быть 0 (отмена лайка) или 1 (поставить лайк)',
      );
    }

    if (value === 1) {
      const existing = await this.likeRepo.findOne({
        where: { user_id: currentUserId, sample_id: sampleId },
      });
      if (!existing) {
        const like = this.likeRepo.create({
          user_id: currentUserId,
          sample_id: sampleId,
        });
        await this.likeRepo.save(like);
      }
      return { liked: 1, message: 'Лайк успешно поставлен' };
    } else {
      await this.likeRepo.delete({
        user_id: currentUserId,
        sample_id: sampleId,
      });
      return { liked: 0, message: 'Лайк успешно снят' };
    }
  }

  // ─── Для фронтенда SSR Handlebars ───
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

    return entities.map((e) => ({
      ...this.serializeSample(e),
      isDraft: e.status === 'draft',
    }));
  }

  async findDraftByUser(userId: number) {
    return this.sampleRepo.findOne({
      where: { creator_id: userId, status: 'draft' },
    });
  }

  async findOneForFeed(id?: number, next?: boolean) {
    return this.findFeed(undefined, id, next);
  }

  async createDraftFrontend(userId: number, title: string) {
    const sample = this.sampleRepo.create({
      title,
      status: 'draft',
      creator_id: userId,
      created_at: new Date(),
    });
    return this.sampleRepo.save(sample);
  }

  async publishDraftFrontend(
    userId: number,
    title: string,
    description: string,
    impuritiesPercent: number,
    gasVolume: number,
  ) {
    const draft = await this.sampleRepo.findOne({
      where: { creator_id: userId, status: 'draft' },
    });
    if (!draft) return null;
    if (title) draft.title = title;
    draft.description = description;
    draft.impurities_percent = impuritiesPercent;
    draft.gas_volume = gasVolume;
    draft.status = 'published';
    draft.formation_date = new Date();
    return this.sampleRepo.save(draft);
  }

  async deleteSampleRaw(userId: number, sampleId: number) {
    return this.deleteSample(userId, sampleId);
  }

  // ─── Сериализатор (рассчитывает 0/1 признаки относительно текущего пользователя) ───
  private serializeSample(e: ChemicalSample, currentUserId?: number) {
    const isCreator =
      currentUserId && Number(e.creator_id) === Number(currentUserId) ? 1 : 0;
    const isLiked =
      currentUserId && e.likes && Array.isArray(e.likes)
        ? e.likes.some((l) => Number(l.user_id) === Number(currentUserId))
          ? 1
          : 0
        : 0;

    return {
      id: e.id,
      title: e.title,
      description: e.description,
      status: e.status,
      image_url: e.image_url,
      video_url: e.video_url,
      impurities_percent: e.impurities_percent,
      gas_volume: e.gas_volume,
      created_at: e.created_at,
      formation_date: e.formation_date,
      likes: e.likes ? e.likes.length : 0,
      is_creator: isCreator,
      is_mine: isCreator,
      is_liked: isLiked,
      liked: isLiked,
    };
  }
}
