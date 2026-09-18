import { GripVertical, ListChecks } from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ListSummary } from "@/lib/lists"

interface ListCardProps {
  list: ListSummary
  onOpen: (list: ListSummary) => void
}

function ListCard({ list, onOpen }: ListCardProps) {
  return (
    <Card
      onClick={() => onOpen(list)}
      className="cursor-pointer bg-white text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{list.name}</span>
        </CardTitle>
        <CardDescription>
          {list.elementCount} elemento(s) · versão v{list.version}
        </CardDescription>
        <CardAction>
          <GripVertical
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </CardAction>
      </CardHeader>
    </Card>
  )
}

export default ListCard