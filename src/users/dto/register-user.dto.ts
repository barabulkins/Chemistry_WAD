import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Имя пользователя (логин)',
    example: 'lab_chemist',
  })
  username: string;

  @ApiProperty({
    description: 'Адрес электронной почты (уникальный логин)',
    example: 'chemist@lab.ru',
  })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
  })
  password: string;
}
