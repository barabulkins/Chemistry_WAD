/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SampleResponseDto = {
    /**
     * Идентификатор образца
     */
    id: number;
    /**
     * Название образца
     */
    title: string;
    /**
     * Описание образца
     */
    description?: string;
    /**
     * Статус образца
     */
    status: SampleResponseDto.status;
    /**
     * Ссылка на изображение в MinIO S3
     */
    image_url: string;
    /**
     * Ссылка на видео в MinIO S3
     */
    video_url: string;
    /**
     * Массовая доля примесей (%)
     */
    impurities_percent?: number;
    /**
     * Объем выделившегося газа (мл)
     */
    gas_volume?: number;
    /**
     * Дата создания записи
     */
    created_at: string;
    /**
     * Дата публикации образца
     */
    formation_date?: string;
    /**
     * Общее количество лайков
     */
    likes: number;
    /**
     * Признак (0/1): является ли текущий пользователь автором образца (0 для гостя)
     */
    is_creator: number;
    /**
     * Признак (0/1): поставил ли текущий пользователь лайк данному образцу (0 для гостя)
     */
    is_liked: number;
};
export namespace SampleResponseDto {
    /**
     * Статус образца
     */
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        DELETED = 'deleted',
    }
}

