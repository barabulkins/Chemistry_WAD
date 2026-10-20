import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../chemical-samples/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterUserDto): Promise<{ id: number; username: string; email: string }> {
    const { username, email, password } = dto;

    if (!username || !username.trim()) {
      throw new BadRequestException('Поле "username" обязательно для заполнения');
    }
    if (!email || !email.trim()) {
      throw new BadRequestException('Поле "email" обязательно для заполнения');
    }
    if (!password || !password.trim()) {
      throw new BadRequestException('Поле "password" обязательно для заполнения');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException(`Пользователь с адресом "${normalizedEmail}" уже зарегистрирован`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const user = this.userRepo.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const saved = await this.userRepo.save(user);
    return {
      id: saved.id,
      username: saved.username,
      email: saved.email,
    };
  }

  async validateUser(dto: LoginUserDto): Promise<User> {
    const { email, password } = dto;

    if (!email || !email.trim() || !password || !password.trim()) {
      throw new BadRequestException('Необходимо указать email и пароль');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный адрес электронной почты или пароль');
    }

    let isValid = false;

    // Поддержка существующих пользователей из ЛР3 со старыми паролями
    if (!user.password || user.password === password.trim()) {
      isValid = true;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
      await this.userRepo.save(user);
    } else if (
      user.password.startsWith('$2a$') ||
      user.password.startsWith('$2b$') ||
      user.password.startsWith('$2y$')
    ) {
      isValid = await bcrypt.compare(password.trim(), user.password);
    } else if (user.password === password.trim()) {
      isValid = true;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
      await this.userRepo.save(user);
    }

    if (!isValid) {
      throw new UnauthorizedException('Неверный адрес электронной почты или пароль');
    }

    return user;
  }

  async findById(id: number): Promise<{ id: number; username: string; email: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
