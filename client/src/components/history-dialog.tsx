import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type {
  ListHistory,
  ListVersionDetail,
  ListVersionSummary,
} from '@/context/lists'

const CHANGE_TYPE_LABEL: Record<string, string> = {
  CREATE: 'Criação',
  ADD: 'Adição',
  EDIT: 'Edição',
  REMOVE: 'Remoção',
  REORDER: 'Reordenação',
  RENAME: 'Renomeação',
  RESTORE: 'Restauração',
}

interface HistoryDialogProps {
  listName: string
  currentVersion: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: () => void
  history: ListHistory | null
  loading: boolean
  error: string | null
  onGetVersion: (versionNumber: number) => Promise<ListVersionDetail>
  onRestore: (versionNumber: number) => Promise<void>
}

function HistoryDialog({
  listName,
  currentVersion,
  open,
  onOpenChange,
  onRefresh,
  history,
  loading,
  error,
  onGetVersion,
  onRestore,
}: HistoryDialogProps) {
  const [restoring, setRestoring] = React.useState<number | null>(null)
  const [restoreError, setRestoreError] = React.useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] =
    React.useState<ListVersionDetail | null>(null)
  const [loadingVersion, setLoadingVersion] = React.useState<number | null>(null)
  const [versionError, setVersionError] = React.useState<string | null>(null)

  const handlePreview = async (versionNumber: number) => {
    setLoadingVersion(versionNumber)
    setVersionError(null)
    try {
      setSelectedVersion(await onGetVersion(versionNumber))
    } catch (err) {
      setVersionError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar esta versão.',
      )
    } finally {
      setLoadingVersion(null)
    }
  }

  const handleRestore = async (versionNumber: number) => {
    setRestoring(versionNumber)
    setRestoreError(null)
    try {
      await onRestore(versionNumber)
    } catch (err) {
      setRestoreError(
        err instanceof Error
          ? err.message
          : 'Não foi possível restaurar esta versão.',
      )
    } finally {
      setRestoring(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setSelectedVersion(null)
          setVersionError(null)
          onRefresh()
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de versões</DialogTitle>
          <DialogDescription>
            Versões da lista “{listName}” (atual: v{currentVersion}).
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="py-3 text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && history && history.versions.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">
              Esta lista ainda não possui versões registradas.
            </p>
          )}

          {!loading &&
            !error &&
            history &&
            history.versions.map((version: ListVersionSummary) => (
              <div
                key={version.versionNumber}
                className="flex flex-col gap-2 rounded-lg border p-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    v{version.versionNumber}
                    {version.versionNumber === history.currentVersion && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (atual)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CHANGE_TYPE_LABEL[version.changeType] ?? version.changeType}
                    {version.description ? ` — ${version.description}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {version.elementCount} elemento(s) ·{' '}
                    {new Date(version.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex w-full shrink-0 gap-1 sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    disabled={loadingVersion === version.versionNumber}
                    onClick={() => void handlePreview(version.versionNumber)}
                  >
                    {loadingVersion === version.versionNumber && (
                      <Loader2 className="animate-spin" />
                    )}
                    Visualizar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    disabled={
                      version.versionNumber === history.currentVersion ||
                      restoring === version.versionNumber
                    }
                    onClick={() => void handleRestore(version.versionNumber)}
                  >
                    {restoring === version.versionNumber && (
                      <Loader2 className="animate-spin" />
                    )}
                    Restaurar
                  </Button>
                </div>
              </div>
            ))}

          {versionError && (
            <p className="text-sm text-destructive">{versionError}</p>
          )}

          {restoreError && (
            <p className="text-sm text-destructive">{restoreError}</p>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>

      <Dialog
        open={selectedVersion !== null}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedVersion(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Organização da versão v{selectedVersion?.versionNumber}
            </DialogTitle>
            <DialogDescription>
              Elementos na ordem em que estavam nessa versão.
            </DialogDescription>
          </DialogHeader>

          {selectedVersion?.elements.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Lista vazia.</p>
          ) : (
            <ol className="max-h-72 list-decimal space-y-2 overflow-y-auto rounded-lg border bg-gray-50 p-3 pl-9 text-sm">
              {selectedVersion?.elements.map((element, index) => (
                <li key={`${element.id}-${index}`} className="wrap-break-word">
                  {element.content}
                </li>
              ))}
            </ol>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default HistoryDialog