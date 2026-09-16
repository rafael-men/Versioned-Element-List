import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PublicUser } from '../../domain/models/user';
import { USER_REPOSITORY, type UserRepository } from '../ports/user.repository';
import { hashPassword } from './password-hasher';

export interface RegisterInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute(input: RegisterInput): Promise<PublicUser> {
    const email = input.email.toLowerCase().trim();

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException(
        'Já existe uma conta cadastrada com esse e-mail.',
      );
    }
    const passwordHash = await hashPassword(input.password);
    return this.users.create(email, passwordHash);
  }
}
