import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.session || !request.session.userId) {
      throw new UnauthorizedException(
        'Необходима авторизация. Пожалуйста, выполните вход в систему (/api/users/login)',
      );
    }
    return true;
  }
}
