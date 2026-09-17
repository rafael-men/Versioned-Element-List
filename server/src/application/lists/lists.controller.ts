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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Lists')
@ApiBearerAuth('access-token')
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
  @ApiOperation({
    summary: 'Criar lista',
    description: 'Cria uma nova lista versionada para o usuário autenticado.',
  })
  @ApiBody({ type: CreateListDto })
  @ApiResponse({ status: 201, description: 'Lista criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateListDto) {
    return this.createList.execute(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar listas do usuário',
    description: 'Retorna todas as listas do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Listas retornadas com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@CurrentUser() user: CurrentUserType) {
    return this.getAllLists.execute(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar lista por id',
    description:
      'Retorna os detalhes da lista e seus elementos na versão atual.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  findOne(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getList.execute(user.id, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar lista',
    description:
      'Substitui o nome e todos os elementos da lista, criando uma nova versão com o histórico.',
  })
  @ApiBody({ type: UpdateListDto })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Lista atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListDto,
  ) {
    return this.updateList.execute(user.id, id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar lista parcialmente',
    description:
      'Atualiza apenas os campos fornecidos. Aceita alteração de nome e/ou edição individual de elementos.',
  })
  @ApiBody({ type: PatchListDto })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Lista atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  patch(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchListDto,
  ) {
    return this.patchList.execute(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir lista',
    description: 'Remove a lista e todo o seu histórico de versões.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Lista excluída com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteList.execute(user.id, id);
  }

  @Post(':id/elements')
  @ApiOperation({
    summary: 'Adicionar elemento à lista',
    description:
      'Adiciona um novo elemento ao final da lista, criando uma nova versão.',
  })
  @ApiBody({ type: AddElementDto })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 201, description: 'Elemento adicionado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  addElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddElementDto,
  ) {
    return this.addElementUc.execute(user.id, id, dto);
  }

  @Patch(':id/elements/:elementId')
  @ApiOperation({
    summary: 'Editar elemento da lista',
    description:
      'Altera o conteúdo de um elemento existente, criando uma nova versão.',
  })
  @ApiBody({ type: EditElementDto })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiParam({
    name: 'elementId',
    description: 'UUID do elemento',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Elemento atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Lista ou elemento não encontrado.',
  })
  editElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
    @Body() dto: EditElementDto,
  ) {
    return this.editElementUc.execute(user.id, id, elementId, dto);
  }

  @Delete(':id/elements/:elementId')
  @ApiOperation({
    summary: 'Remover elemento da lista',
    description: 'Remove um elemento da lista, criando uma nova versão.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiParam({
    name: 'elementId',
    description: 'UUID do elemento',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Elemento removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Lista ou elemento não encontrado.',
  })
  removeElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
  ) {
    return this.removeElementUc.execute(user.id, id, elementId);
  }

  @Put(':id/elements/:elementId/reorder')
  @ApiOperation({
    summary: 'Reordenar elemento da lista',
    description:
      'Move um elemento para uma nova posição, criando uma nova versão.',
  })
  @ApiBody({ type: ReorderElementDto })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiParam({
    name: 'elementId',
    description: 'UUID do elemento',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Elemento reordenado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Lista ou elemento não encontrado.',
  })
  reorderElement(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('elementId', ParseUUIDPipe) elementId: string,
    @Body() dto: ReorderElementDto,
  ) {
    return this.reorderElementUc.execute(user.id, id, elementId, dto);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: 'Histórico de versões da lista',
    description:
      'Retorna o histórico de todas as versões da lista com o tipo de alteração.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  history(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getHistory.execute(user.id, id);
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({
    summary: 'Buscar versão específica da lista',
    description:
      'Retorna os elementos e detalhes de uma versão específica da lista.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiParam({
    name: 'versionNumber',
    description: 'Número da versão (começa em 1)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Versão retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista ou versão não encontrada.' })
  getVersion(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ) {
    return this.getVersionDetail.execute(user.id, id, versionNumber);
  }

  @Post(':id/restore/:versionNumber')
  @ApiOperation({
    summary: 'Restaurar versão da lista',
    description:
      'Restaura a lista para os elementos de uma versão anterior, criando uma nova versão.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da lista',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @ApiParam({
    name: 'versionNumber',
    description: 'Número da versão a ser restaurada',
    example: 1,
  })
  @ApiResponse({ status: 201, description: 'Lista restaurada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lista ou versão não encontrada.' })
  restore(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ) {
    return this.restoreList.execute(user.id, id, versionNumber);
  }
}
