import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {
  UserProfileDto,
  LoginResponseDto,
  MessageResponseDto,
} from './dto/user-response.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@ApiTags('Аутентификация и пользователи')
@Controller('api/users')
export class ApiUsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── 1. Регистрация нового пользователя ───
  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description:
      'Создает нового пользователя с защищенным хэшированием пароля (bcrypt) и автоматически выполняет вход, создавая серверную сессию и устанавливая сессионную куку connect.sid.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или email уже занят',
  })
  async register(
    @Body() dto: RegisterUserDto,
    @Req() req: Request,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.register(dto);
    // Автоматическая авторизация при регистрации
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;
    return user;
  }

  // ─── 2. Аутентификация (Вход) ───
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Аутентификация пользователя (Вход)',
    description:
      'Проверяет адрес электронной почты и пароль. При успехе создает серверную сессию и возвращает сессионный cookie connect.sid. Все последующие запросы от имени создателя будут авторизованы.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация, сессия создана',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный логин или пароль',
  })
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.validateUser(dto);
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;

    return {
      message: 'Успешная авторизация',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  // ─── 3. Деавторизация (Выход) ───
  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Деавторизация пользователя (Выход)',
    description:
      'Уничтожает активную серверную сессию и удаляет идентификационную куку connect.sid у клиента.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход из системы',
    type: MessageResponseDto,
  })
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      res.status(200).json({
        message: 'Успешный выход из системы. Сессия уничтожена.',
      });
    });
  }

  // ─── 4. Профиль текущего пользователя ───
  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('connect.sid')
  @ApiOperation({
    summary: 'Получение профиля текущего авторизованного пользователя',
    description:
      'Возвращает идентификатор и контактные данные пользователя из активной сессии. Без авторизации возвращает 401 Unauthorized.',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные текущего пользователя',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  async getProfile(
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<UserProfileDto> {
    return this.usersService.findById(currentUser!.userId);
  }
}
