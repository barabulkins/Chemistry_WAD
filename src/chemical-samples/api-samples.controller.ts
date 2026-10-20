import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChemicalSamplesService } from './chemical-samples.service';

// ─── API контроллер: /api/samples ───────────────────────────────────────────
@Controller('api/samples')
export class ApiSamplesController {
  constructor(private readonly service: ChemicalSamplesService) {}

  // 1. GET /api/samples?gas_volume=5  — список опубликованных с фильтрацией
  // Включает признак is_creator (0/1): совпадает ли создатель с текущим пользователем
  @Get()
  async getAll(@Query('gas_volume') gasVolume?: string) {
    const vol = gasVolume && gasVolume.trim() !== '' ? Number(gasVolume) : undefined;
    return this.service.findAll(vol);
  }

  // 2. GET /api/samples/feed  — лента (только опубликованные)
  // Включает признак is_liked (0/1): лайкнул ли текущий пользователь этот образец
  // Без параметров: возвращает первый образец (стартовая точка ленты)
  // С параметрами ?id=X&next=true (или /feed/:id?next=true): возвращает следующий образец с закольцовыванием
  @Get(['feed', 'feed/:id'])
  async getFeed(
    @Param('id') paramId?: string,
    @Query('id') queryId?: string,
    @Query('next') next?: string,
  ) {
    const rawId = queryId || paramId;
    const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : undefined;
    return this.service.findFeed(id, next === 'true');
  }

  // 3. GET /api/samples/draft  — черновик текущего пользователя (не более 1 записи, id не указывается)
  @Get('draft')
  async getDraft() {
    return this.service.findDraft();
  }

  // 4. POST /api/samples  — создание черновика + обязательная загрузка файлов изображения и видео в MinIO
  // Файлы image и video обязательны! Если не заполнены — возвращается 400 Bad Request
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async create(
    @Body('title') title?: string,
    @UploadedFiles()
    files?: { image?: any[]; video?: any[] },
  ) {
    if (!title || !title.trim()) {
      throw new BadRequestException('Название образца (поле "title") обязательно для заполнения');
    }
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];

    if (!imageFile) {
      throw new BadRequestException('Необходимо выбрать файл изображения (поле формы "image")');
    }
    if (!videoFile) {
      throw new BadRequestException('Необходимо выбрать файл короткого видео (поле формы "video")');
    }

    return this.service.createDraft(
      title.trim(),
      imageFile,
      videoFile,
    );
  }

  // 5. PUT /api/samples/publish  — публикация (смена статуса draft → published + доп. поля)
  @Put('publish')
  async publish(
    @Body('title') title?: string,
    @Body('description') description?: string,
    @Body('impurities_percent') impuritiesPercent?: any,
    @Body('gas_volume') gasVolume?: any,
  ) {
    const imp =
      impuritiesPercent !== undefined && impuritiesPercent !== null && impuritiesPercent !== ''
        ? parseFloat(String(impuritiesPercent))
        : undefined;
    const gas =
      gasVolume !== undefined && gasVolume !== null && gasVolume !== ''
        ? parseInt(String(gasVolume), 10)
        : undefined;

    return this.service.publishDraft(title, description, imp, gas);
  }

  // 6. DELETE /api/samples/:id  — soft delete через SQL курсор (только услуги текущего пользователя)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSample(id);
  }

  // 7. POST /api/samples/:id/like  — лайк / отмена лайка { value: 0 | 1 }
  @Post(':id/like')
  @HttpCode(200)
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('value') value?: any,
  ) {
    if (value === undefined || value === null || (Number(value) !== 0 && Number(value) !== 1)) {
      throw new BadRequestException('Поле "value" обязательно и должно быть равным 0 (отмена) или 1 (лайк)');
    }
    return this.service.toggleLike(id, Number(value));
  }
}
