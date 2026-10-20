import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleDto {
  @ApiProperty({
    description: 'Название химического образца',
    example: 'Сульфат меди (II)',
  })
  title: string;

  @ApiProperty({
    description: 'Файл изображения образца (.jpg, .png)',
    type: 'string',
    format: 'binary',
  })
  image: any;

  @ApiProperty({
    description: 'Файл короткого видео демонстрации образца (.mp4)',
    type: 'string',
    format: 'binary',
  })
  video: any;
}
