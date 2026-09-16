import { PublicUser, UserRecord } from '../../domain/models/user';

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(email: string, passwordHash: string): Promise<PublicUser>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
