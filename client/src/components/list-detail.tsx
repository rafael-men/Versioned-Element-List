import * as React from 'react'
import { History, Loader2, Plus, Trash2 } from 'lucide-react'

import DeleteListDialog from '@/components/delete-list-dialog'
import ElementList from '@/components/element-list'
import HistoryDialog from '@/components/history-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useListsApi } from '@/context/api'
import type { ElementItem, ListHistory, ListState } from '@/lib/lists'

interface ListDetailProps {
  list: ListState
  onListChange: (list: ListState) => void
  onDelete: (list: ListState) => Promise<void>
  onClose: () => void
}

function ListDetail({ list, onListChange, onDelete, onClose }: ListDetailProps) {
  const api = useListsApi()

  const [renaming, setRenaming] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState(list.name)
  const [newElement, setNewElement] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [history, setHistory] = React.useState<ListHistory | null>(null)
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  const [historyError, setHistoryError] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const run = async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setError(null)
    setPending(true)
    try {
      return await action()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
      )
      return undefined
    } finally {
      setPending(false)
    }
  }

  const reconcile = (elements: ElementItem[], version?: number) => {
    onListChange({
      ...list,
      version: version ?? list.version,
      elements,
    })
  }

  const refreshHistory = async () => {
    setLoadingHistory(true)
    setHistoryError(null)
    try {
      const result = await api.getHistory(list.id)
      setHistory(result)
    } catch (err) {
      setHistoryError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o histórico.',
      )
    } finally {
      setLoadingHistory(false)
    }
  }

  const restoreVersion = async (versionNumber: number) => {
    const result = await run(() => api.restore(list.id, versionNumber))
    if (result) {
      reconcile(result.elements, result.version)
      setHistoryOpen(false)
    }
  }

  const moveElement = async (elementId: string, newPosition: number) => {
    const result = await run(() =>
      api.reorderElement(list.id, elementId, newPosition),
    )
    if (result) {
      reconcile(result.elements, result.version)
    }
  }

  const addElement = async (content: string) => {
    const result = await run(() => api.addElement(list.id, content))
    if (result) {
      reconcile(result.elements, result.version)
      setNewElement('')
    }
  }

  const editElement = async (elementId: string, content: string) => {
    const result = await run(() => api.editElement(list.id, elementId, content))
    if (result) {
      reconcile(result.elements, result.version)
    }
  }

  const removeElement = async (elementId: string) => {
    const result = await run(() => api.removeElement(list.id, elementId))
    if (result) {
      reconcile(
        list.elements.filter((element) => element.id !== elementId),
        list.version + 1,
      )
    }
  }

  const saveName = async () => {
    const name = nameDraft.trim()
    if (!name || name === list.name) {
      setRenaming(false)
      setNameDraft(list.name)
      return
    }
    const result = await run(() => api.renameList(list.id, name))
    if (result) {
      onListChange(result)
      setRenaming(false)
    }
  }

  const submitElement = (event: React.FormEvent) => {
    event.preventDefault()
    const content = newElement.trim()
    if (!content) {
      return
    }
    void addElement(content)
  }

  return (
    <Card className="w-full max-w-2xl bg-white text-black">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {renaming ? (
              <Input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void saveName()
                  } else if (event.key === 'Escape') {
                    setRenaming(false)
                    setNameDraft(list.name)
                  }
                }}
                autoFocus
                className="h-7 max-w-64"
                aria-label="Renomear lista"
              />
            ) : (
              <button
                type="button"
                title="Renomear lista"
                onClick={() => setRenaming(true)}
                className="max-w-72 truncate text-left"
              >
                {list.name}
              </button>
            )}
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              v{list.version}
            </span>
          </div>

          <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setHistoryOpen(true)
                void refreshHistory()
              }}
            >
              <History />
              Histórico
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Excluir
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {list.elements.length} elemento(s) — arraste, use as setas ou escolha
          a posição para reordenar.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <p className="mb-2 rounded bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {list.elements.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Esta lista está vazia. Adicione o primeiro elemento abaixo.
          </p>
        ) : (
          <ElementList
            elements={list.elements}
            onMove={moveElement}
            onEdit={editElement}
            onRemove={removeElement}
          />
        )}

        <form onSubmit={submitElement} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            data-testid="new-element"
            value={newElement}
            onChange={(event) => setNewElement(event.target.value)}
            placeholder="Novo elemento..."
            disabled={pending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            className="w-full sm:w-auto"
            disabled={pending || !newElement.trim()}
          >
            {pending && <Loader2 className="animate-spin" />}
            <Plus />
            Adicionar
          </Button>
        </form>
      </CardContent>

      <HistoryDialog
        listName={list.name}
        currentVersion={list.version}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onRefresh={() => void refreshHistory()}
        history={history}
        loading={loadingHistory}
        error={historyError}
        onGetVersion={(versionNumber) => api.getVersion(list.id, versionNumber)}
        onRestore={restoreVersion}
      />
      <DeleteListDialog
        listName={list.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => onDelete(list)}
      />
    </Card>
  )
}

export default ListDetail