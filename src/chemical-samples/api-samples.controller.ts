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
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ChemicalSamplesService } from './chemical-samples.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import {
  CurrentUser,
  CurrentUserData,
  OptionalUserId,
} from '../auth/current-user.decorator';
import { CreateSampleDto } from './dto/create-sample.dto';
import { PublishSampleDto } from './dto/publish-sample.dto';
import {
  ToggleLikeDto,
  ToggleLikeResponseDto,
} from './dto/toggle-like.dto';
import {
  SampleResponseDto,
  DeleteSampleResponseDto,
} from './dto/sample-response.dto';

@Controller('api/samples')
export class ApiSamplesController {
  constructor(private readonly service: ChemicalSamplesService) {}

  // =========================================================================
  // ─── ПУБЛИЧНЫЕ МЕТОДЫ (Чтение / Доступны БЕЗ авторизации гостю) ───────────
  // =========================================================================

  // 1. GET /api/samples?gas_volume=5  — список опубликованных с фильтрацией
  @Get()
  @ApiTags('Публичные методы (Чтение — без авторизации)')
  @ApiOperation({
    summary: 'Получение списка опубликованных образцов с фильтрацией',
    description:
      'Возвращает список всех опубликованных химических образцов. Доступно всем посетителям без авторизации. Если пользователь авторизован, признаки is_creator и is_liked вычисляются для него; для гостя возвращаются нули (0).',
  })
  @ApiQuery({
    name: 'gas_volume',
    required: false,
    type: Number,
    description: 'Фильтрация по объёму выделившегося газа (мл)',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Список опубликованных образцов',
    type: [SampleResponseDto],
  })
  async getAll(
    @OptionalUserId() userId?: number,
    @Query('gas_volume') gasVolume?: string,
  ): Promise<SampleResponseDto[]> {
    const vol =
      gasVolume && gasVolume.trim() !== '' ? Number(gasVolume) : undefined;
    return this.service.findAll(userId, vol);
  }

  // 2. GET /api/samples/feed  — лента (только опубликованные)
  @Get(['feed', 'feed/:id'])
  @ApiTags('Публичные методы (Чтение — без авторизации)')
  @ApiOperation({
    summary: 'Лента опубликованных образцов (по одной карточке)',
    description:
      'Режим постраничного просмотра карточек ленты с закольцовыванием. Без параметров возвращает первый образец. С параметрами ?id=X&next=true возвращает следующий. Доступно без авторизации.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    description: 'ID текущего образца для отсчета',
    example: 1,
  })
  @ApiQuery({
    name: 'next',
    required: false,
    type: String,
    description: 'Флаг "true" для перехода к следующей карточке ленты',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные карточки образца',
    type: SampleResponseDto,
  })
  async getFeed(
    @OptionalUserId() userId?: number,
    @Param('id') paramId?: string,
    @Query('id') queryId?: string,
    @Query('next') next?: string,
  ): Promise<SampleResponseDto | null> {
    const rawId = queryId || paramId;
    const id = rawId && !isNaN(Number(rawId)) ? Number(rawId) : undefined;
    return this.service.findFeed(userId, id, next === 'true');
  }

  // 3. GET /api/samples/draft  — черновик текущего пользователя
  @Get('creator/draft')
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Получение текущего черновика авторизованного создателя',
    description:
      'Возвращает активный черновик текущего пользователя для редактирования и последующей публикации. Доступно только авторизованному создателю.',
  })
  @ApiResponse({
    status: 200,
    description: 'Активный черновик или null',
    type: SampleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован (гость не имеет доступа)',
  })
  async getDraft(
    @CurrentUser() user: CurrentUserData,
  ): Promise<SampleResponseDto | null> {
    return this.service.findDraft(user.userId);
  }

  // Также поддерживаем старый алиас /api/samples/draft
  @Get('draft')
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Получение черновика текущего создателя (алиас)',
    description:
      'Возвращает активный черновик текущего пользователя (синоним creator/draft). Требует авторизации.',
  })
  @ApiResponse({ status: 200, type: SampleResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getDraftLegacy(
    @CurrentUser() user: CurrentUserData,
  ): Promise<SampleResponseDto | null> {
    return this.service.findDraft(user.userId);
  }

  // 4. GET /api/samples/:id  — детальный просмотр одного опубликованного образца
  @Get(':id')
  @ApiTags('Публичные методы (Чтение — без авторизации)')
  @ApiOperation({
    summary: 'Детальный просмотр опубликованного образца по ID',
    description:
      'Возвращает подробные характеристики конкретного опубликованного химического образца. Доступно без авторизации.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный идентификатор образца',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Данные образца',
    type: SampleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Образец не найден или не опубликован',
  })
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @OptionalUserId() userId?: number,
  ): Promise<SampleResponseDto> {
    return this.service.findOne(userId, id);
  }

  // =========================================================================
  // ─── МЕТОДЫ СОЗДАТЕЛЯ (Защищенные / Доступны ТОЛЬКО с авторизацией) ──────
  // =========================================================================

  // 5. POST /api/samples  — создание черновика + автозаполнение автора + загрузка файлов в MinIO
  @Post()
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Создание нового черновика услуги с автозаполнением создателя',
    description:
      'Инициализирует новый черновик химического образца. creator_id АВТОМАТИЧЕСКИ заполняется из сессии текущего пользователя! Файлы изображения и видео загружаются в S3 хранилище MinIO. Требует авторизации.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSampleDto })
  @ApiResponse({
    status: 201,
    description: 'Черновик успешно создан с автозаполнением автора',
    type: SampleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Не заполнены обязательные файлы или уже есть активный черновик',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован (гость не имеет права создавать)',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body('title') title?: string,
    @UploadedFiles()
    files?: { image?: any[]; video?: any[] },
  ): Promise<SampleResponseDto> {
    if (!title || !title.trim()) {
      throw new BadRequestException(
        'Название образца (поле "title") обязательно для заполнения',
      );
    }
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];

    if (!imageFile) {
      throw new BadRequestException(
        'Необходимо выбрать файл изображения (поле формы "image")',
      );
    }
    if (!videoFile) {
      throw new BadRequestException(
        'Необходимо выбрать файл короткого видео (поле формы "video")',
      );
    }

    // Автозаполнение создателя: передается user.userId из сессии
    return this.service.createDraft(
      user.userId,
      title.trim(),
      imageFile,
      videoFile,
    );
  }

  // 6. PUT /api/samples/publish  — публикация черновика создателя
  @Put('publish')
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Публикация черновика текущего создателя',
    description:
      'Переводит черновик текущего авторизованного пользователя из статуса "draft" в "published", фиксирует дату публикации formation_date = NOW() и параметры образца. Требует авторизации.',
  })
  @ApiBody({ type: PublishSampleDto })
  @ApiResponse({
    status: 200,
    description: 'Образец успешно опубликован',
    type: SampleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Черновик для публикации не найден',
  })
  async publish(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: PublishSampleDto,
  ): Promise<SampleResponseDto> {
    const imp =
      dto.impurities_percent !== undefined &&
      dto.impurities_percent !== null &&
      String(dto.impurities_percent) !== ''
        ? parseFloat(String(dto.impurities_percent))
        : undefined;
    const gas =
      dto.gas_volume !== undefined &&
      dto.gas_volume !== null &&
      String(dto.gas_volume) !== ''
        ? parseInt(String(dto.gas_volume), 10)
        : undefined;

    return this.service.publishDraft(
      user.userId,
      dto.title,
      dto.description,
      imp,
      gas,
    );
  }

  // 7. DELETE /api/samples/:id  — soft delete через SQL курсор (только свои образцы)
  @Delete(':id')
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Логическое удаление образца (Soft Delete через курсор SQL)',
    description:
      'Логически удаляет образец (status = deleted) с использованием SQL-курсора FOR UPDATE в транзакции. Удалить разрешено ТОЛЬКО собственный образец создателя (creator_id == session.userId). Требует авторизации.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID удаляемого химического образца',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Образец успешно удален',
    type: DeleteSampleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Образец не найден или принадлежит другому автору',
  })
  async remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteSampleResponseDto> {
    return this.service.deleteSample(user.userId, id);
  }

  // 8. POST /api/samples/:id/like  — лайк / отмена лайка от имени авторизованного пользователя
  @Post(':id/like')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard)
  @ApiTags('Методы создателя (Защищенные — с авторизацией)')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Поставить / отменить лайк образцу',
    description:
      'Ставит (value=1) или снимает (value=0) отметку "нравится" от имени текущего авторизованного пользователя. Требует авторизации.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID образца',
    example: 1,
  })
  @ApiBody({ type: ToggleLikeDto })
  @ApiResponse({
    status: 200,
    description: 'Результат операции лайка',
    type: ToggleLikeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректное значение value (должно быть 0 или 1)',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Образец не найден',
  })
  async like(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleLikeDto,
  ): Promise<ToggleLikeResponseDto> {
    const value = dto?.value;
    if (
      value === undefined ||
      value === null ||
      (Number(value) !== 0 && Number(value) !== 1)
    ) {
      throw new BadRequestException(
        'Поле "value" обязательно и должно быть равным 0 (отмена) или 1 (лайк)',
      );
    }
    return this.service.toggleLike(user.userId, id, Number(value));
  }
}
