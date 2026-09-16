import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user';
import { PublicUser, UserRecord } from '../../domain/models/user';
import { UserRepository } from '../../use-cases/ports/user.repository';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      createdAt: user.createdAt,
    };
  }

  async create(email: string, passwordHash: string): Promise<PublicUser> {
    const user = await this.repo.save(
      this.repo.create({ email, password: passwordHash }),
    );
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}
