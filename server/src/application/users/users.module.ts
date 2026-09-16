import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user';
import { USER_REPOSITORY } from '../../use-cases/ports/user.repository';
import { TypeOrmUserRepository } from '../../infrastructure/repositories/typeorm-user.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { RegisterUseCase } from '../../use-cases/user/register';
import { LoginUseCase } from '../../use-cases/user/login';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SecurityModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    RegisterUseCase,
    LoginUseCase,
  ],
})
export class UsersModule {}
