'use client'

import { useState, useEffect } from 'react'
import { BoardStatus, Card } from '@/types/database'
import { getBoardCards } from '@/app/actions/boards'
import { CustomKanbanCard } from './CustomKanbanCard'
import { CardModal } from './CardModal'

interface CustomKanbanColumnProps {
  status: BoardStatus
  boardId: string
  onUpdate: () => void
}

export function CustomKanbanColumn({ status, boardId, onUpdate }: CustomKanbanColumnProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  useEffect(() => {
    fetchCards()
  }, [status.id, boardId])

  async function fetchCards() {
    const result = await getBoardCards(boardId)
    if (result?.data) {
      // Filter cards for this status
      const statusCards = result.data.filter(c => c.status_id === status.id)
      setCards(statusCards)
    }
  }

  const handleUpdate = () => {
    fetchCards()
    onUpdate()
  }

  const statusCards = cards.filter(c => c.status_id === status.id)

  return (
    <>
      <div className="flex-shrink-0 w-80">
        <div className="bg-[hsl(var(--color-surface))] rounded-lg p-4 border border-[hsl(var(--color-border))]">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color || '#94a3b8' }}
              />
              <h3 className="font-semibold text-[hsl(var(--color-text-primary))]">
                {status.name}
              </h3>
              <span className="text-xs text-[hsl(var(--color-text-secondary))]">
                ({statusCards.length})
              </span>
            </div>
          </div>

          {/* Cards Container */}
          <div className="space-y-3 min-h-[200px]">
            {statusCards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                  No cards yet
                </p>
              </div>
            ) : (
              statusCards.map(card => (
                <CustomKanbanCard
                  key={card.id}
                  card={card}
                  onUpdate={handleUpdate}
                  onEdit={setEditingCard}
                />
              ))
            )}
            
            {/* Add Card Button */}
            <button 
              onClick={() => setIsAddingCard(true)}
              className="w-full text-left px-3 py-2 text-sm text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-surface-hover))] rounded-lg transition-colors border border-dashed border-[hsl(var(--color-border))]"
            >
              + Add Card
            </button>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      <CardModal
        isOpen={isAddingCard}
        onClose={() => setIsAddingCard(false)}
        onSuccess={handleUpdate}
        boardId={boardId}
        statusId={status.id}
      />

      {/* Edit Card Modal */}
      <CardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSuccess={handleUpdate}
        boardId={boardId}
        statusId={status.id}
        card={editingCard}
      />
    </>
  )
}
