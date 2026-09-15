import { Inject, Injectable } from '@nestjs/common';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';

@Injectable()
export class GetAllListsUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  execute(userId: string) {
    return this.lists.findAllSummary(userId);
  }
}
