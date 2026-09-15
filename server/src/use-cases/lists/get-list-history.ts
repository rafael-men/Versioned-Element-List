import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LIST_VERSION_REPOSITORY,
  type ListVersionRepository,
} from '../ports/list-version.repository';

@Injectable()
export class GetListHistoryUseCase {
  constructor(
    @Inject(LIST_VERSION_REPOSITORY)
    private readonly versions: ListVersionRepository,
  ) {}

  async execute(userId: string, listId: string) {
    const history = await this.versions.findHistory(userId, listId);
    if (!history) {
      throw new NotFoundException('Lista não encontrada.');
    }
    return history;
  }
}
