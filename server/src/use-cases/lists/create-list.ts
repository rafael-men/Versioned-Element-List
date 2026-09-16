import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';
import { sanitizeText } from '../common/sanitize-text';

export interface CreateListInput {
  name: string;
  elements?: string[];
}

@Injectable()
export class CreateListUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, input: CreateListInput) {
    const name = sanitizeText(input.name, 'nome');
    const elements = (input.elements ?? []).map((content) => ({
      id: randomUUID(),
      content: sanitizeText(content, 'elemento'),
    }));
    return this.lists.create(userId, name, elements);
  }
}
