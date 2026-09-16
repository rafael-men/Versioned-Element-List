import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PublicUser } from '../../domain/models/user';
import { USER_REPOSITORY, type UserRepository } from '../ports/user.repository';
import { TOKEN_GENERATOR, type TokenGenerator } from '../ports/token-generator';
import { verifyPassword } from './password-hasher';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const record = await this.users.findByEmail(
      input.email.toLowerCase().trim(),
    );

    if (
      !record ||
      !(await verifyPassword(input.password, record.passwordHash))
    ) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const user: PublicUser = {
      id: record.id,
      email: record.email,
      createdAt: record.createdAt,
    };

    const token = await this.tokens.sign(user);
    return { token, user };
  }
}
