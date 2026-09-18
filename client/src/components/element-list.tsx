import * as React from 'react'

import ElementRow from '@/components/element-row'
import type { ElementItem } from '@/lib/lists'

interface ElementListProps {
  elements: ElementItem[]
  onMove: (elementId: string, newPosition: number) => Promise<void>
  onEdit: (elementId: string, content: string) => Promise<void>
  onRemove: (elementId: string) => Promise<void>
}

function ElementList({ elements, onMove, onEdit, onRemove }: ElementListProps) {
  const dragged = React.useRef<ElementItem | null>(null)
  const dragOverIndex = React.useRef<number | null>(null)
  const [dropTarget, setDropTarget] = React.useState<number | null>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const clearDrag = () => {
    dragged.current = null
    dragOverIndex.current = null
    setDropTarget(null)
  }

  const handleDragOver = (event: React.DragEvent) => {
    if (!dragged.current) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const container = listRef.current
    if (!container) {
      return
    }
    const rows = Array.from(
      container.querySelectorAll<HTMLLIElement>('li[data-index]'),
    )
    if (rows.length === 0) {
      return
    }

    let target = 0
    for (const row of rows) {
      const rect = row.getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (event.clientY >= mid) {
        target = Number(row.dataset.index) + 1
      } else {
        break
      }
    }
    target = Math.min(target, rows.length)
    dragOverIndex.current = target
    setDropTarget(target)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDropTarget(null)
    const draggedElement = dragged.current
    const target = dragOverIndex.current
    clearDrag()

    if (!draggedElement || target === null) {
      return
    }
    void onMove(draggedElement.id, target)
  }

  return (
    <ul
      ref={listRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => {
        if (!dragged.current) {
          return
        }
        dragOverIndex.current = null
        setDropTarget(null)
      }}
    >
      {elements.map((element, index) => (
        <ElementRow
          key={element.id}
          element={element}
          index={index}
          count={elements.length}
          onMove={onMove}
          onEdit={onEdit}
          onRemove={onRemove}
          onDragStart={(elementId) => {
            dragged.current =
              elements.find((item) => item.id === elementId) ?? null
          }}
          onDragEnd={clearDrag}
          isDropIndicator={dropTarget === index}
        />
      ))}
    </ul>
  )
}

export default ElementList