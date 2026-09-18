import type {
  AddElementResult,
  CreateListInput,
  EditElementResult,
  ListHistory,
  ListState,
  ListSummary,
  ListVersionDetail,
  ReorderResult,
  RestoreResult,
} from '@/lib/lists'
import { useApi } from './hooks'

function useListsApi() {
  const { baseUrl, request } = useApi()

  function call<T>(path: string, method = 'GET', body?: unknown) {
    return request<T>(path, {
      method,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  }

  return {
    baseUrl,
    getLists: () => call<ListSummary[]>('/lists'),
    getList: (listId: string) => call<ListState>(`/lists/${listId}`),
    createList: (input: CreateListInput) =>
      call<ListState>('/lists', 'POST', input),
    renameList: (listId: string, name: string) =>
      call<ListState>(`/lists/${listId}`, 'PATCH', { name }),
    deleteList: (listId: string) =>
      call<boolean>(`/lists/${listId}`, 'DELETE'),
    addElement: (listId: string, content: string) =>
      call<AddElementResult>(`/lists/${listId}/elements`, 'POST', { content }),
    editElement: (listId: string, elementId: string, content: string) =>
      call<EditElementResult>(
        `/lists/${listId}/elements/${elementId}`,
        'PATCH',
        { content },
      ),
    removeElement: (listId: string, elementId: string) =>
      call<boolean>(`/lists/${listId}/elements/${elementId}`, 'DELETE'),
    reorderElement: (
      listId: string,
      elementId: string,
      newPosition: number,
    ) =>
      call<ReorderResult>(
        `/lists/${listId}/elements/${elementId}/reorder`,
        'PUT',
        { newPosition },
      ),
    getHistory: (listId: string) =>
      call<ListHistory>(`/lists/${listId}/history`),
    getVersion: (listId: string, versionNumber: number) =>
      call<ListVersionDetail>(`/lists/${listId}/versions/${versionNumber}`),
    restore: (listId: string, versionNumber: number) =>
      call<RestoreResult>(
        `/lists/${listId}/restore/${versionNumber}`,
        'POST',
      ),
  }
}

export type ListsApi = ReturnType<typeof useListsApi>
export { useListsApi }
