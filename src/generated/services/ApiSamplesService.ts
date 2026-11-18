/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSampleDto } from '../models/CreateSampleDto';
import type { DeleteSampleResponseDto } from '../models/DeleteSampleResponseDto';
import type { PublishSampleDto } from '../models/PublishSampleDto';
import type { SampleResponseDto } from '../models/SampleResponseDto';
import type { ToggleLikeDto } from '../models/ToggleLikeDto';
import type { ToggleLikeResponseDto } from '../models/ToggleLikeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiSamplesService {
    /**
     * GET получение всех услуг (каталог опубликованных образцов)
     * Получение всех услуг (химических образцов) аналитической лаборатории. Доступно всем посетителям без авторизации. Если пользователь авторизован, признаки is_creator и is_liked вычисляются для него; для гостя возвращаются нули (0).
     * @param gasVolume Фильтрация по объёму выделившегося газа (мл)
     * @returns SampleResponseDto Список опубликованных образцов
     * @throws ApiError
     */
    public static apiSamplesControllerGetAll(
        gasVolume?: number,
    ): CancelablePromise<Array<SampleResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples',
            query: {
                'gas_volume': gasVolume,
            },
        });
    }
    /**
     * Создание нового черновика услуги с автозаполнением создателя
     * Инициализирует новый черновик химического образца. creator_id АВТОМАТИЧЕСКИ заполняется из сессии текущего пользователя! Файлы изображения и видео загружаются в S3 хранилище MinIO. Требует авторизации.
     * @param formData
     * @returns SampleResponseDto Черновик успешно создан с автозаполнением автора
     * @throws ApiError
     */
    public static apiSamplesControllerCreate(
        formData: CreateSampleDto,
    ): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/samples',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Не заполнены обязательные файлы или уже есть активный черновик`,
                401: `Не авторизован (гость не имеет права создавать)`,
            },
        });
    }
    /**
     * Лента опубликованных образцов (по одной карточке)
     * Режим постраничного просмотра карточек ленты с закольцовыванием. Без параметров возвращает первый образец. С параметрами ?id=X&next=true возвращает следующий. Доступно без авторизации.
     * @param id ID текущего образца для отсчета
     * @param next Флаг "true" для перехода к следующей карточке ленты
     * @returns SampleResponseDto Данные карточки образца
     * @throws ApiError
     */
    public static apiSamplesControllerGetFeed0(
        id?: number,
        next?: string,
    ): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples/feed',
            query: {
                'id': id,
                'next': next,
            },
        });
    }
    /**
     * Лента опубликованных образцов (по одной карточке)
     * Режим постраничного просмотра карточек ленты с закольцовыванием. Без параметров возвращает первый образец. С параметрами ?id=X&next=true возвращает следующий. Доступно без авторизации.
     * @param id
     * @param next Флаг "true" для перехода к следующей карточке ленты
     * @returns SampleResponseDto Данные карточки образца
     * @throws ApiError
     */
    public static apiSamplesControllerGetFeed1(
        id: string,
        next?: string,
    ): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples/feed/{id}',
            path: {
                'id': id,
            },
            query: {
                'next': next,
            },
        });
    }
    /**
     * Получение текущего черновика авторизованного создателя
     * Возвращает активный черновик текущего пользователя для редактирования и последующей публикации. Доступно только авторизованному создателю.
     * @returns SampleResponseDto Активный черновик или null
     * @throws ApiError
     */
    public static apiSamplesControllerGetDraft(): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples/creator/draft',
            errors: {
                401: `Не авторизован (гость не имеет доступа)`,
            },
        });
    }
    /**
     * Получение черновика текущего создателя (алиас)
     * Возвращает активный черновик текущего пользователя (синоним creator/draft). Требует авторизации.
     * @returns SampleResponseDto
     * @throws ApiError
     */
    public static apiSamplesControllerGetDraftLegacy(): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples/draft',
            errors: {
                401: `Не авторизован`,
            },
        });
    }
    /**
     * Детальный просмотр опубликованного образца по ID
     * Возвращает подробные характеристики конкретного опубликованного химического образца. Доступно без авторизации.
     * @param id Уникальный идентификатор образца
     * @returns SampleResponseDto Данные образца
     * @throws ApiError
     */
    public static apiSamplesControllerGetOne(
        id: number,
    ): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/samples/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Образец не найден или не опубликован`,
            },
        });
    }
    /**
     * Логическое удаление образца (Soft Delete через курсор SQL)
     * Логически удаляет образец (status = deleted) с использованием SQL-курсора FOR UPDATE в транзакции. Удалить разрешено ТОЛЬКО собственный образец создателя (creator_id == session.userId). Требует авторизации.
     * @param id ID удаляемого химического образца
     * @returns DeleteSampleResponseDto Образец успешно удален
     * @throws ApiError
     */
    public static apiSamplesControllerRemove(
        id: number,
    ): CancelablePromise<DeleteSampleResponseDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/samples/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Не авторизован`,
                404: `Образец не найден или принадлежит другому автору`,
            },
        });
    }
    /**
     * Публикация черновика текущего создателя
     * Переводит черновик текущего авторизованного пользователя из статуса "draft" в "published", фиксирует дату публикации formation_date = NOW() и параметры образца. Требует авторизации.
     * @param requestBody
     * @returns SampleResponseDto Образец успешно опубликован
     * @throws ApiError
     */
    public static apiSamplesControllerPublish(
        requestBody: PublishSampleDto,
    ): CancelablePromise<SampleResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/samples/publish',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Не авторизован`,
                404: `Черновик для публикации не найден`,
            },
        });
    }
    /**
     * Поставить / отменить лайк образцу
     * Ставит (value=1) или снимает (value=0) отметку "нравится" от имени текущего авторизованного пользователя. Требует авторизации.
     * @param id ID образца
     * @param requestBody
     * @returns ToggleLikeResponseDto Результат операции лайка
     * @throws ApiError
     */
    public static apiSamplesControllerLike(
        id: number,
        requestBody: ToggleLikeDto,
    ): CancelablePromise<ToggleLikeResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/samples/{id}/like',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректное значение value (должно быть 0 или 1)`,
                401: `Не авторизован`,
                404: `Образец не найден`,
            },
        });
    }
}
