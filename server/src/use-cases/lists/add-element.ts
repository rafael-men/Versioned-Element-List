import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';
import { sanitizeText } from '../common/sanitize-text';

export interface AddElementInput {
  content: string;
}

@Injectable()
export class AddElementUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, listId: string, input: AddElementInput) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const content = sanitizeText(input.content, 'conteúdo');
    const added = { id: randomUUID(), content };
    const updated = await this.lists.commit(userId, listId, {
      elements: [...state.elements, added],
      changeType: ChangeType.ADD,
      description: `Elemento adicionado: "${content.slice(0, 50)}".`,
    });

    return { version: updated!.version, elements: updated!.elements, added };
  }
}
