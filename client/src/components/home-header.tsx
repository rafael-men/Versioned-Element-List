import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface HomeHeaderProps {
  userName?: string
  onCreateDisabled?: boolean
  onOpenCreate: () => void
}

function HomeHeader({
  userName,
  onCreateDisabled = false,
  onOpenCreate,
}: HomeHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-white">Minhas listas</h1>
        <p className="text-sm text-white/70">
          Bem-vindo, {userName ?? 'usuário'}!
        </p>
      </div>
      <Button onClick={onOpenCreate} disabled={onCreateDisabled}>
        <Plus />
        Nova lista
      </Button>
    </header>
  )
}

export default HomeHeader