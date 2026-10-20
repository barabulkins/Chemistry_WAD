import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class CurrentUserData {
  userId: number;
  username: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.session || !request.session.userId) {
      return undefined;
    }
    return {
      userId: request.session.userId,
      username: request.session.username || '',
      email: request.session.email || '',
    };
  },
);

export const OptionalUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.session?.userId;
  },
);
