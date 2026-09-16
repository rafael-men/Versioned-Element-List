import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentUser {
  id: string;
  email: string;
}

export type AuthenticatedRequest = Request & { user?: CurrentUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }
    return request.user;
  },
);
