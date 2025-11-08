'use client'

import { useState } from 'react'
import { Card as CardType } from '@/types/database'
import { deleteCard } from '@/app/actions/boards'
import { Card } from '@/components/ui/Card'

interface CustomKanbanCardProps {
  card: CardType
  onUpdate: () => void
  onEdit: (card: CardType) => void
}

export function CustomKanbanCard({ card, onUpdate, onEdit }: CustomKanbanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return
    
    setIsDeleting(true)
    const result = await deleteCard(card.id)
    
    if (result?.error) {
      alert(result.error)
      setIsDeleting(false)
    } else {
      onUpdate()
    }
  }

  return (
    <Card 
      className="p-3 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onEdit(card)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[hsl(var(--color-text-primary))] text-sm mb-1">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-[hsl(var(--color-text-secondary))] line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity p-1"
          title="Delete card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Card>
  )
}
