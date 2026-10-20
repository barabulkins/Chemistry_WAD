import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ChemicalSamplesService } from '../chemical-samples/chemical-samples.service';

// ─── API контроллер: /api/users ─────────────────────────────────────────────
@Controller('api/users')
export class ApiUsersController {
  constructor(private readonly service: ChemicalSamplesService) {}

  // POST /api/users/register  — регистрация нового пользователя
  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.service.registerUser(username, email, password);
  }

  // POST /api/users/login  — аутентификация (заглушка для ЛР4)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Body('password') _password: string,
  ) {
    // Заглушка: авторизация будет реализована в ЛР4 (JWT / Session)
    return {
      message: 'Аутентификация будет реализована в ЛР4',
      email,
      token: 'stub-token',
    };
  }

  // POST /api/users/logout  — деавторизация (заглушка для ЛР4)
  @Post('logout')
  @HttpCode(200)
  async logout() {
    // Заглушка: инвалидация токена будет в ЛР4
    return { message: 'Деавторизация будет реализована в ЛР4' };
  }
}
