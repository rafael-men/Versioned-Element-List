import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementList } from '../../domain/entities/element-list';
import { ListVersion } from '../../domain/entities/list-version';
import { ELEMENT_LIST_REPOSITORY } from '../../use-cases/ports/element-list.repository';
import { LIST_VERSION_REPOSITORY } from '../../use-cases/ports/list-version.repository';
import { TypeOrmElementListRepository } from '../../infrastructure/repositories/typeorm-element-list.repository';
import { TypeOrmListVersionRepository } from '../../infrastructure/repositories/typeorm-list-version.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { CreateListUseCase } from '../../use-cases/lists/create-list';
import { GetAllListsUseCase } from '../../use-cases/lists/get-all-lists';
import { GetListUseCase } from '../../use-cases/lists/get-list.use-case';
import { UpdateListUseCase } from '../../use-cases/lists/update-list';
import { PatchListUseCase } from '../../use-cases/lists/patch-list';
import { DeleteListUseCase } from '../../use-cases/lists/delete-list';
import { AddElementUseCase } from '../../use-cases/lists/add-element';
import { EditElementUseCase } from '../../use-cases/lists/edit-element';
import { RemoveElementUseCase } from '../../use-cases/lists/remove-element';
import { ReorderElementUseCase } from '../../use-cases/lists/reorder-element';
import { GetListHistoryUseCase } from '../../use-cases/lists/get-list-history';
import { GetListVersionUseCase } from '../../use-cases/lists/get-list-version';
import { RestoreListUseCase } from '../../use-cases/lists/restore-list';
import { ListsController } from './lists.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElementList, ListVersion]),
    SecurityModule,
  ],
  controllers: [ListsController],
  providers: [
    {
      provide: ELEMENT_LIST_REPOSITORY,
      useClass: TypeOrmElementListRepository,
    },
    {
      provide: LIST_VERSION_REPOSITORY,
      useClass: TypeOrmListVersionRepository,
    },
    CreateListUseCase,
    GetAllListsUseCase,
    GetListUseCase,
    UpdateListUseCase,
    PatchListUseCase,
    DeleteListUseCase,
    AddElementUseCase,
    EditElementUseCase,
    RemoveElementUseCase,
    ReorderElementUseCase,
    GetListHistoryUseCase,
    GetListVersionUseCase,
    RestoreListUseCase,
  ],
})
export class ListsModule {}
