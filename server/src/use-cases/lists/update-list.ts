import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';
import { sanitizeText } from '../common/sanitize-text';

export interface UpdateListInput {
  name: string;
  elements: string[];
}

@Injectable()
export class UpdateListUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, listId: string, input: UpdateListInput) {
    const name = sanitizeText(input.name, 'nome');
    const elements = input.elements.map((content) => ({
      id: randomUUID(),
      content: sanitizeText(content, 'elemento'),
    }));

    const state = await this.lists.commit(userId, listId, {
      name,
      elements,
      changeType: ChangeType.REPLACE,
      description: 'Lista atualizada.',
    });

    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }
    return state;
  }
}
