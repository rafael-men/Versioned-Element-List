import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PositionSelectProps {
  value: number
  count: number
  onSelect: (position: number) => void
  disabled?: boolean
}

function PositionSelect({
  value,
  count,
  onSelect,
  disabled,
}: PositionSelectProps) {
  const labelId = React.useId()

  if (count <= 0) {
    return null
  }

  return (
    <label htmlFor={labelId} className="flex items-center gap-1 text-xs text-muted-foreground">
      Posição
      <Select
        key={value}
        value={String(value)}
        onValueChange={(next) => onSelect(Number(next))}
        disabled={disabled || count <= 1}
      >
        <SelectTrigger id={labelId} aria-label="Selecionar posição" size="sm">
          <SelectValue placeholder={String(value + 1)} />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: count }, (_, position) => (
            <SelectItem key={position} value={String(position)}>
              {position + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

export default PositionSelect