import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Адрес электронной почты пользователя',
    example: 'chemist@lab.ru',
  })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
  })
  password: string;
}
