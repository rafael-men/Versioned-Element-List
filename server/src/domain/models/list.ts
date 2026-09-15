import { ChangeType } from '../enums/change-type';

export interface ElementItem {
  id: string;
  content: string;
}

export interface ListState {
  id: string;
  name: string;
  version: number;
  elements: ElementItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListSummary {
  id: string;
  name: string;
  version: number;
  elementCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListVersionSummary {
  versionNumber: number;
  changeType: ChangeType;
  description: string | null;
  createdAt: Date;
  elementCount: number;
}

export interface ListHistory {
  listId: string;
  currentVersion: number;
  versions: ListVersionSummary[];
}

export interface ListVersionDetail {
  versionNumber: number;
  changeType: ChangeType;
  description: string | null;
  createdAt: Date;
  elements: ElementItem[];
}
