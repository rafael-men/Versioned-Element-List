export interface ElementItem {
  id: string
  content: string
}

export interface ListSummary {
  id: string
  name: string
  version: number
  elementCount: number
  createdAt: string
  updatedAt: string
}

export interface ListState {
  id: string
  name: string
  version: number
  elements: ElementItem[]
  createdAt: string
  updatedAt: string
}

export type ChangeType =
  | 'CREATE'
  | 'ADD'
  | 'EDIT'
  | 'REMOVE'
  | 'REORDER'
  | 'RENAME'
  | 'RESTORE'

export interface ListVersionSummary {
  versionNumber: number
  changeType: ChangeType
  description: string | null
  createdAt: string
  elementCount: number
}

export interface ListVersionDetail {
  versionNumber: number
  changeType: ChangeType
  description: string | null
  createdAt: string
  elements: ElementItem[]
}

export interface ListHistory {
  listId: string
  currentVersion: number
  versions: ListVersionSummary[]
}

export interface ElementMutationResult {
  version: number
  elements: ElementItem[]
}

export interface ReorderResult extends ElementMutationResult {
  moved: ElementItem
}

export interface AddElementResult extends ElementMutationResult {
  added: ElementItem
}

export interface EditElementResult extends ElementMutationResult {
  edited: ElementItem
}

export interface RemoveElementResult extends ElementMutationResult {
  removed: ElementItem
}

export interface RestoreResult {
  version: number
  restoredFromVersion: number
  elements: ElementItem[]
}

export interface CreateListInput {
  name: string
  elements?: string[]
}