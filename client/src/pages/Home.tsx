import * as React from 'react'
import { ArrowLeft } from 'lucide-react'

import CreateListDialog from '@/components/create-list-dialog'
import HomeHeader from '@/components/home-header'
import ListDetail from '@/components/list-detail'
import ListOverview from '@/components/list-overview'
import { Button } from '@/components/ui/button'
import { useAuth, useListsApi } from '@/context/api'
import type { ListState, ListSummary } from '@/context/lists'

function Home() {
  const api = useListsApi()
  const { user } = useAuth()

  const [lists, setLists] = React.useState<ListSummary[]>([])
  const [selected, setSelected] = React.useState<ListState | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const creatingListRef = React.useRef(false)

  const listError = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback

  const refreshLists = React.useCallback(async () => {
    setError(null)
    setLists(await api.getLists())
  }, [api])

  React.useEffect(() => {
    let cancelled = false
    api
      .getLists()
      .then((result) => {
        if (!cancelled) {
          setLists(result)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(listError(err, 'Não foi possível carregar suas listas.'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const openList = async (summary: ListSummary) => {
    setError(null)
    try {
      const state = await api.getList(summary.id)
      setSelected(state)
    } catch (err) {
      setError(listError(err, 'Não foi possível abrir a lista.'))
    }
  }

  const handleListChange = (next: ListState) => {
    setSelected(next)
    setLists((current) =>
      current.map((summary) =>
        summary.id === next.id
          ? {
            ...summary,
            name: next.name,
            version: next.version,
            elementCount: next.elements.length,
          }
          : summary,
      ),
    )
  }

  const handleDelete = async (list: ListState) => {
    try {
      await api.deleteList(list.id)
      setSelected(null)
      setLists((current) => current.filter((summary) => summary.id !== list.id))
    } catch (err) {
      throw new Error(listError(err, 'Não foi possível excluir a lista.'), {
        cause: err,
      })
    }
  }

  const handleCreate = async (name: string, elements: string[]) => {
    if (creatingListRef.current) {
      return
    }
    creatingListRef.current = true
    try {
      const created = await api.createList({
        name,
        ...(elements.length > 0 ? { elements } : {}),
      })
      setLists((current) => [
        {
          id: created.id,
          name: created.name,
          version: created.version,
          elementCount: created.elements.length,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
        ...current,
      ])
    } finally {
      creatingListRef.current = false
    }
  }

  return (
    <>
      <HomeHeader
        userName={user?.email}
        onCreateDisabled={loading || Boolean(selected)}
        onOpenCreate={() => setCreateOpen(true)}
      />

      {selected ? (
        <div className="flex flex-col gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft />
              Voltar para listas
            </Button>
          </div>
          <ListDetail
            list={selected}
            onListChange={handleListChange}
            onDelete={handleDelete}
            onClose={() => setSelected(null)}
          />
        </div>
      ) : (
        <ListOverview
          lists={lists}
          loading={loading}
          error={error}
          onRetry={() =>
            void refreshLists().catch((err) =>
              setError(listError(err, 'Não foi possível carregar suas listas.')),
            )
          }
          onOpen={(item) => void openList(item)}
          onOpenCreate={() => setCreateOpen(true)}
        />
      )}

      <CreateListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </>
  )
}

export default Home