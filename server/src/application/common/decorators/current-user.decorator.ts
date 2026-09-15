import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

export interface CurrentUser {
  id: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new BadRequestException(
        'Cabeçalho x-user-id obrigatório (provisório até implementar JWT).',
      );
    }
    if (!isUUID(userId)) {
      throw new BadRequestException('O userId deve ser um UUID válido.');
    }

    return { id: userId };
  },
);
