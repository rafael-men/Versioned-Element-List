import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LIST_VERSION_REPOSITORY,
  type ListVersionRepository,
} from '../ports/list-version.repository';

@Injectable()
export class GetListVersionUseCase {
  constructor(
    @Inject(LIST_VERSION_REPOSITORY)
    private readonly versions: ListVersionRepository,
  ) {}

  async execute(userId: string, listId: string, versionNumber: number) {
    const detail = await this.versions.findByVersion(
      userId,
      listId,
      versionNumber,
    );
    if (!detail) {
      throw new NotFoundException('Versão não encontrada.');
    }
    return detail;
  }
}
