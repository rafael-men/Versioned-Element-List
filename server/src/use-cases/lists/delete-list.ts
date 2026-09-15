import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

@Injectable()
export class DeleteListUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, listId: string) {
    const deleted = await this.lists.delete(userId, listId);
    if (!deleted) {
      throw new NotFoundException('Lista não encontrada.');
    }
    return { removed: true };
  }
}
