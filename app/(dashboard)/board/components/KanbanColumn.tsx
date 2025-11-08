import { Status, Case, Client } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { KanbanCard } from './KanbanCard'

interface CaseWithRelations extends Case {
  clients?: Client
  status?: Status
}

interface KanbanColumnProps {
  status: Status
  cases: CaseWithRelations[]
  onUpdate: () => void
}

export function KanbanColumn({ status, cases, onUpdate }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b border-[hsl(var(--color-border))]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[hsl(var(--color-text-primary))]">
              {status.name}
            </h3>
            <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-secondary))]">
              {cases.length}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-280px)]">
          {cases.map(caseItem => (
            <KanbanCard key={caseItem.id} caseItem={caseItem} />
          ))}
          {cases.length === 0 && (
            <p className="text-center text-[hsl(var(--color-text-secondary))] text-sm py-8">
              No cases
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
