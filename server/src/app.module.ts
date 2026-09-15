import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './infrastructure/config/data/data-source';
import { ListsModule } from './application/lists/lists.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), ListsModule],
})
export class AppModule {}
