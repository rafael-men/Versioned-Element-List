import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';
import {
  LIST_VERSION_REPOSITORY,
  type ListVersionRepository,
} from '../ports/list-version.repository';

@Injectable()
export class RestoreListUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
    @Inject(LIST_VERSION_REPOSITORY)
    private readonly versions: ListVersionRepository,
  ) { }

  async execute(userId: string, listId: string, versionNumber: number) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const target = await this.versions.findByVersion(
      userId,
      listId,
      versionNumber,
    );
    if (!target) {
      throw new NotFoundException('Versão não encontrada.');
    }

    const updated = await this.lists.restore(
      userId,
      listId,
      versionNumber,
      target.elements.map((e) => ({ ...e })),
    );

    return {
      version: updated!.version,
      restoredFromVersion: versionNumber,
      elements: updated!.elements,
    };
  }
}
