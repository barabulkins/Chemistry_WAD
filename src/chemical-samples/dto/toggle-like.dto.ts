import { ApiProperty } from '@nestjs/swagger';

export class ToggleLikeDto {
  @ApiProperty({
    description: 'Действие с лайком: 1 — поставить лайк, 0 — снять лайк',
    example: 1,
    enum: [0, 1],
  })
  value: number;
}

export class ToggleLikeResponseDto {
  @ApiProperty({ description: 'Текущий статус лайка пользователя (0 или 1)', example: 1 })
  liked: number;

  @ApiProperty({ description: 'Сообщение о результате', example: 'Лайк успешно поставлен' })
  message: string;
}
