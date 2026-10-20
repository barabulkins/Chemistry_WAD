import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'Идентификатор пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Имя пользователя', example: 'lab_chemist' })
  username: string;

  @ApiProperty({ description: 'Электронная почта', example: 'chemist@lab.ru' })
  email: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Сообщение о результате авторизации', example: 'Успешная авторизация' })
  message: string;

  @ApiProperty({ description: 'Данные авторизованного пользователя', type: () => UserProfileDto })
  user: UserProfileDto;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Информационное сообщение', example: 'Успешный выход из системы' })
  message: string;
}
