import { BoardStatus } from '@/types/database'
import { CustomKanbanColumn } from './CustomKanbanColumn'

interface CustomKanbanBoardProps {
  statuses: BoardStatus[]
  boardId: string
  onUpdate: () => void
}

export function CustomKanbanBoard({ statuses, boardId, onUpdate }: CustomKanbanBoardProps) {
  // Sort statuses by position
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {sortedStatuses.map(status => (
        <CustomKanbanColumn
          key={status.id}
          status={status}
          boardId={boardId}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
