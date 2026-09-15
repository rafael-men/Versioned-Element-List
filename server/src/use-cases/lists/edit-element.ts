import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

export interface EditElementInput {
  content: string;
}

@Injectable()
export class EditElementUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(
    userId: string,
    listId: string,
    elementId: string,
    input: EditElementInput,
  ) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const index = state.elements.findIndex((e) => e.id === elementId);
    if (index === -1) {
      throw new NotFoundException('Elemento não encontrado.');
    }

    const previous = state.elements[index].content;
    const elements = state.elements.map((e, i) =>
      i === index ? { ...e, content: input.content } : e,
    );

    const updated = await this.lists.commit(userId, listId, {
      elements,
      changeType: ChangeType.EDIT,
      description: `Elemento editado: "${previous.slice(0, 30)}" -> "${input.content.slice(0, 30)}".`,
    });

    return { version: updated!.version, elements: updated!.elements };
  }
}
