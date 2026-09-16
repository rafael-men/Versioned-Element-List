import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './infrastructure/config/data/data-source';
import { ListsModule } from './application/lists/lists.module';
import { UsersModule } from './application/users/users.module';
import { SecurityModule } from './infrastructure/security/security.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    SecurityModule,
    ListsModule,
    UsersModule,
  ],
})
export class AppModule {}
