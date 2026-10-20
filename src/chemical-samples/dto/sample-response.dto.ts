import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SampleResponseDto {
  @ApiProperty({ description: 'Идентификатор образца', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название образца', example: 'Известняк' })
  title: string;

  @ApiPropertyOptional({ description: 'Описание образца', example: 'Технический образец...' })
  description?: string;

  @ApiProperty({ description: 'Статус образца', example: 'published', enum: ['draft', 'published', 'deleted'] })
  status: string;

  @ApiProperty({ description: 'Ссылка на изображение в MinIO S3', example: 'http://127.0.0.1:9000/chemistry1/img_123.jpg' })
  image_url: string;

  @ApiProperty({ description: 'Ссылка на видео в MinIO S3', example: 'http://127.0.0.1:9000/chemistry1/vid_123.mp4' })
  video_url: string;

  @ApiPropertyOptional({ description: 'Массовая доля примесей (%)', example: 15.5 })
  impurities_percent?: number;

  @ApiPropertyOptional({ description: 'Объем выделившегося газа (мл)', example: 45 })
  gas_volume?: number;

  @ApiProperty({ description: 'Дата создания записи', example: '2026-10-21T00:00:00.000Z' })
  created_at: Date;

  @ApiPropertyOptional({ description: 'Дата публикации образца', example: '2026-10-21T01:00:00.000Z' })
  formation_date?: Date;

  @ApiProperty({ description: 'Общее количество лайков', example: 5 })
  likes: number;

  @ApiProperty({
    description: 'Признак (0/1): является ли текущий пользователь автором образца (0 для гостя)',
    example: 1,
  })
  is_creator: number;

  @ApiProperty({
    description: 'Признак (0/1): поставил ли текущий пользователь лайк данному образцу (0 для гостя)',
    example: 0,
  })
  is_liked: number;
}

export class DeleteSampleResponseDto {
  @ApiProperty({ description: 'Сообщение об удалении', example: 'Образец успешно удалён (soft delete)' })
  message: string;

  @ApiProperty({ description: 'Идентификатор удаленного образца', example: 1 })
  id: number;
}
