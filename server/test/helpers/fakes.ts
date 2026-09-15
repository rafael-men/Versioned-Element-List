import { randomUUID } from 'node:crypto';
import { ChangeType } from '../../src/domain/enums/change-type';
import type {
  ElementItem,
  ListState,
  ListSummary,
  ListVersionDetail,
} from '../../src/domain/models/list';
import type {
  ElementListRepository,
  ListChange,
} from '../../src/use-cases/ports/element-list.repository';
import type { ListVersionRepository } from '../../src/use-cases/ports/list-version.repository';

export class FakeElementListRepository implements ElementListRepository {
  private readonly lists = new Map<string, ListState>();
  private readonly owners = new Map<string, string>();

  async create(
    userId: string,
    name: string,
    initialElements: ElementItem[],
  ): Promise<ListState> {
    const now = new Date();
    const list: ListState = {
      id: randomUUID(),
      name,
      version: 1,
      elements: initialElements,
      createdAt: now,
      updatedAt: now,
    };
    this.lists.set(list.id, list);
    this.owners.set(list.id, userId);
    return list;
  }

  async findState(
    userId: string,
    listId: string,
  ): Promise<ListState | null> {
    if (this.owners.get(listId) !== userId) return null;
    return this.lists.get(listId) ?? null;
  }

  async findAllSummary(userId: string): Promise<ListSummary[]> {
    const result: ListSummary[] = [];
    for (const [id, list] of this.lists) {
      if (this.owners.get(id) === userId) {
        result.push({
          id,
          name: list.name,
          version: list.version,
          elementCount: list.elements.length,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
        });
      }
    }
    return result;
  }

  async commit(
    userId: string,
    listId: string,
    change: ListChange,
  ): Promise<ListState | null> {
    const current = await this.findState(userId, listId);
    if (!current) return null;

    const updated: ListState = {
      ...current,
      name: change.name ?? current.name,
      version: current.version + 1,
      elements: change.elements,
      updatedAt: new Date(),
    };
    this.lists.set(listId, updated);
    return updated;
  }

  async delete(userId: string, listId: string): Promise<boolean> {
    if (this.owners.get(listId) !== userId) return false;
    this.lists.delete(listId);
    this.owners.delete(listId);
    return true;
  }
}

export class FakeListVersionRepository implements ListVersionRepository {
  private readonly versions = new Map<string, ListVersionDetail[]>();
  private readonly owners = new Map<string, string>();

  seed(
    userId: string,
    listId: string,
    version: ListVersionDetail,
  ): void {
    this.owners.set(listId, userId);
    const list = this.versions.get(listId) ?? [];
    list.push(version);
    this.versions.set(listId, list);
  }

  seedDefault(
    userId: string,
    listId: string,
    elements: ElementItem[],
    changeType: ChangeType = ChangeType.CREATE,
  ): void {
    this.seed(userId, listId, {
      versionNumber: 1,
      changeType,
      description: null,
      createdAt: new Date(),
      elements,
    });
  }

  async findHistory(userId: string, listId: string) {
    if (this.owners.get(listId) !== userId) return null;
    const list = this.versions.get(listId) ?? [];
    return {
      listId,
      currentVersion: list.length ? Math.max(...list.map((v) => v.versionNumber)) : 0,
      versions: [...list]
        .sort((a, b) => b.versionNumber - a.versionNumber)
        .map((v) => ({
          versionNumber: v.versionNumber,
          changeType: v.changeType,
          description: v.description,
          createdAt: v.createdAt,
          elementCount: v.elements.length,
        })),
    };
  }

  async findByVersion(
    userId: string,
    listId: string,
    versionNumber: number,
  ): Promise<ListVersionDetail | null> {
    if (this.owners.get(listId) !== userId) return null;
    return (
      (this.versions.get(listId) ?? []).find(
        (v) => v.versionNumber === versionNumber,
      ) ?? null
    );
  }
}