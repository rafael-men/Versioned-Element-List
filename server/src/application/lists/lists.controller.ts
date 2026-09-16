import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../infrastructure/security/current-user.decorator';
import { CurrentUser as CurrentUserType } from '../../infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
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
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { PatchListDto } from '../dto/patch-list.dto';
import { AddElementDto } from '../dto/add-element.dto';
import { EditElementDto } from '../dto/edit-element.dto';
import { ReorderElementDto } from '../dto/reorder-element.dto';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(
    private readonly createList: CreateListUseCase,
    private readonly getAllLists: GetAllListsUseCase,
    private readonly getList: GetListUseCase,
    private readonly updateList: UpdateListUseCase,
    private readonly patchList: PatchListUseCase,
    private readonly deleteList: DeleteListUseCase,
    private readonly addElementUc: AddElementUseCase,
    private readonly editElementUc: EditElementUseCase,
    private readonly removeElementUc: RemoveElementUseCase,
    private readonly reorderElementUc: ReorderElementUseCase,
    private readonly getHistory: GetListHistoryUseCase,
    private readonly getVersionDetail: GetListVersionUseCase,
    private readonly restoreList: RestoreListUseCase,
  ) {}

  @Post()
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateListDto) {
    return this.createList.execute(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserType) {
    return this.getAllLists.execute(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getList.execute(user.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListDto,
  ) {
    return this.updateList.execute(user.id, id, dto);
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchListDto,
  ) {
    return this.patchList.execute(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteList.execute(user.id, id);
  }

  @Post(':id/elements')
  addElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddElementDto,
  ) {
    return this.addElementUc.execute(user.id, id, dto);
  }

  @Patch(':id/elements/:elementId')
  editElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
    @Body() dto: EditElementDto,
  ) {
    return this.editElementUc.execute(user.id, id, elementId, dto);
  }

  @Delete(':id/elements/:elementId')
  removeElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
  ) {
    return this.removeElementUc.execute(user.id, id, elementId);
  }

  @Put(':id/elements/:elementId/reorder')
  reorderElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
    @Body() dto: ReorderElementDto,
  ) {
    return this.reorderElementUc.execute(user.id, id, elementId, dto);
  }

  @Get(':id/history')
  history(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getHistory.execute(user.id, id);
  }

  @Get(':id/versions/:versionNumber')
  getVersion(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ) {
    return this.getVersionDetail.execute(user.id, id, versionNumber);
  }

  @Post(':id/restore/:versionNumber')
  restore(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ) {
    return this.restoreList.execute(user.id, id, versionNumber);
  }
}
