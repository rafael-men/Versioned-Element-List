import { ListHistory, ListVersionDetail } from '../../domain/models/list';

export interface ListVersionRepository {
  findHistory(userId: string, listId: string): Promise<ListHistory | null>;
  findByVersion(
    userId: string,
    listId: string,
    versionNumber: number,
  ): Promise<ListVersionDetail | null>;
}

export const LIST_VERSION_REPOSITORY = Symbol('LIST_VERSION_REPOSITORY');
