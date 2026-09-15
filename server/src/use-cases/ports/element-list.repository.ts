import { ChangeType } from '../../domain/enums/change-type';
import { ElementItem, ListState, ListSummary } from '../../domain/models/list';

export interface ListChange {
  name?: string;
  elements: ElementItem[];
  changeType: ChangeType;
  description: string;
}

export interface ElementListRepository {
  create(
    userId: string,
    name: string,
    initialElements: ElementItem[],
  ): Promise<ListState>;
  findState(userId: string, listId: string): Promise<ListState | null>;
  findAllSummary(userId: string): Promise<ListSummary[]>;
  commit(
    userId: string,
    listId: string,
    change: ListChange,
  ): Promise<ListState | null>;
  delete(userId: string, listId: string): Promise<boolean>;
}

export const ELEMENT_LIST_REPOSITORY = Symbol('ELEMENT_LIST_REPOSITORY');
