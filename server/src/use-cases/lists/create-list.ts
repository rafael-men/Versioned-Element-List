import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

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
    const elements = (input.elements ?? []).map((content) => ({
      id: randomUUID(),
      content,
    }));
    return this.lists.create(userId, input.name, elements);
  }
}
