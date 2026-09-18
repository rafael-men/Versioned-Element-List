import { Loader2, Plus } from 'lucide-react'

import ListCard from '@/components/list-card'
import { Button } from '@/components/ui/button'
import type { ListSummary } from '@/lib/lists'

interface ListOverviewProps {
  lists: ListSummary[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onOpen: (list: ListSummary) => void
  onOpenCreate: () => void
}

function ListOverview({
  lists,
  loading,
  error,
  onRetry,
  onOpen,
  onOpenCreate,
}: ListOverviewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-white/70">
        <Loader2 className="size-5 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tente novamente
        </Button>
      </div>
    )
  }

  if (lists.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center">
        <h2 className="text-base font-medium text-black">
          Você ainda não tem listas
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie sua primeira lista versionada para começar.
        </p>
        <Button onClick={onOpenCreate} className="mt-4">
          <Plus />
          Nova lista
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {lists.map((summary) => (
        <ListCard key={summary.id} list={summary} onOpen={onOpen} />
      ))}
    </div>
  )
}

export default ListOverview