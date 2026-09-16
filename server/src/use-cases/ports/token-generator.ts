import { PublicUser } from '../../domain/models/user';

export interface TokenGenerator {
  sign(user: PublicUser): Promise<string>;
}

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
