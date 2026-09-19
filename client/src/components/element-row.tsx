import * as React from "react"
import { ArrowDown, ArrowUp, GripVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ElementItem } from "@/context/lists"
import PositionSelect from "@/components/positions-select"

interface ElementRowProps {
  element: ElementItem
  index: number
  count: number
  onMove: (elementId: string, newPosition: number) => Promise<void>
  onEdit: (elementId: string, content: string) => Promise<void>
  onRemove: (elementId: string) => Promise<void>
  onDragStart: (elementId: string) => void
  onDragEnd: () => void
  isDropIndicator?: boolean
}

function ElementRow({
  element,
  index,
  count,
  onMove,
  onEdit,
  onRemove,
  onDragStart,
  onDragEnd,
  isDropIndicator = false,
}: ElementRowProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(element.content)
  const [pending, setPending] = React.useState(false)
  const [positionSelecting, setPositionSelecting] = React.useState(false)

  const save = async () => {
    const content = draft.trim()
    if (!content || content === element.content) {
      setEditing(false)
      setDraft(element.content)
      return
    }
    setPending(true)
    try {
      await onEdit(element.id, content)
      setEditing(false)
    } finally {
      setPending(false)
    }
  }

  const handlePositionSelect = async (position: number) => {
    if (position === index) {
      return
    }
    setPositionSelecting(true)
    try {
      await onMove(element.id, position)
    } finally {
      setPositionSelecting(false)
    }
  }

  return (
    <li
      onDragOver={(event) => {
        if (!editing) {
          event.preventDefault()
        }
      }}
      onDragEnd={onDragEnd}
      data-index={index}
      className={cn(
        "flex w-full flex-wrap items-center gap-1.5 border-b px-2 py-1.5 last:border-b-0",
        isDropIndicator && "border-t-2 border-t-primary"
      )}
    >
      <span
        draggable={!editing}
        title="Arrastar para reordenar"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move'
          onDragStart(element.id)
        }}
        onDragEnd={onDragEnd}
      >
        <GripVertical className="size-4" />
      </span>

      <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
        {index + 1}
      </span>

      {editing ? (
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void save()
            } else if (event.key === 'Escape') {
              setEditing(false)
              setDraft(element.content)
            }
          }}
          autoFocus
          className="h-7 min-w-0 flex-1 basis-0"
          aria-label="Editar elemento"
        />
      ) : (
        <span className="min-w-0 flex-1 basis-0 wrap-break-word text-sm">
          {element.content}
        </span>
      )}

      <div className="flex w-full shrink-0 items-center justify-end gap-0.5 sm:w-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mover para cima"
          onClick={() => void handlePositionSelect(Math.max(0, index - 1))}
          disabled={pending || positionSelecting || index === 0}
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mover para baixo"
          onClick={() => void handlePositionSelect(Math.min(count - 1, index + 1))}
          disabled={pending || positionSelecting || index === count - 1}
        >
          <ArrowDown />
        </Button>

        <PositionSelect
          value={index}
          count={count}
          onSelect={(position) => void handlePositionSelect(position)}
          disabled={pending || positionSelecting}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Editar conteúdo"
          onClick={() => {
            setEditing((current) => !current)
            setDraft(element.content)
          }}
          disabled={pending || positionSelecting}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remover elemento"
          onClick={() => void onRemove(element.id)}
          disabled={pending || positionSelecting}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  )
}

export default ElementRow