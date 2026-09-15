import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

@Injectable()
export class RemoveElementUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, listId: string, elementId: string) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const index = state.elements.findIndex((e) => e.id === elementId);
    if (index === -1) {
      throw new NotFoundException('Elemento não encontrado.');
    }

    const removed = state.elements[index];
    const elements = state.elements.filter((_, i) => i !== index);

    const updated = await this.lists.commit(userId, listId, {
      elements,
      changeType: ChangeType.REMOVE,
      description: `Elemento removido: "${removed.content.slice(0, 50)}".`,
    });

    return {
      version: updated!.version,
      elements: updated!.elements,
      removed,
    };
  }
}
