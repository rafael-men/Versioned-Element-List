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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function parseElements(input: string): string[] {
  return input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, elements: string[]) => Promise<void>
}

function CreateListDialog({ open, onOpenChange, onCreate }: CreateListDialogProps) {
  const [name, setName] = React.useState('')
  const [elementsInput, setElementsInput] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    setCreating(true)
    setError(null)
    try {
      await onCreate(name.trim(), parseElements(elementsInput))
      setName('')
      setElementsInput('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível criar a lista.',
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Nova lista</DialogTitle>
            <DialogDescription>
              Defina um nome e, se quiser, os elementos iniciais (um por linha).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-name" className="text-black">Nome</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Compras do mês"
              required
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-elements" className="text-black">Elementos iniciais (opcional)</Label>
            <textarea
              id="list-elements"
              value={elementsInput}
              onChange={(event) => setElementsInput(event.target.value)}
              placeholder={"Leite\nPão\nOvos"}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={creating || !name.trim()}>
              {creating && <Loader2 className="animate-spin" />}
              Criar lista
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateListDialog