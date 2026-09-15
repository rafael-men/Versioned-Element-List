import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

export interface ReorderElementInput {
  newPosition: number;
}

@Injectable()
export class ReorderElementUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(
    userId: string,
    listId: string,
    elementId: string,
    input: ReorderElementInput,
  ) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const index = state.elements.findIndex((e) => e.id === elementId);
    if (index === -1) {
      throw new NotFoundException('Elemento não encontrado na lista.');
    }

    const elements = [...state.elements];
    const [moved] = elements.splice(index, 1);

    if (input.newPosition < 0 || input.newPosition > elements.length) {
      throw new BadRequestException(
        `Posição inválida. A posição deve estar entre 0 e ${elements.length} (após a remoção do elemento).`,
      );
    }

    elements.splice(input.newPosition, 0, moved);

    const updated = await this.lists.commit(userId, listId, {
      elements,
      changeType: ChangeType.REORDER,
      description: `Elemento movido para a posição ${input.newPosition}.`,
    });

    return {
      version: updated!.version,
      elements: updated!.elements,
      moved,
    };
  }
}
