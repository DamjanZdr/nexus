'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCard, updateCard } from '@/app/actions/boards'
import { Card as CardType } from '@/types/database'

interface CardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  boardId: string
  statusId: string
  card?: CardType | null
}

export function CardModal({ isOpen, onClose, onSuccess, boardId, statusId, card }: CardModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!card

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
    setError(null)
  }, [card, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = isEdit
      ? await updateCard(card.id, { title, description })
      : await createCard(boardId, statusId, title, description)

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setTitle('')
      setDescription('')
      setSubmitting(false)
      onSuccess()
      onClose()
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setTitle('')
      setDescription('')
      setError(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Edit Card' : 'Add Card'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter card title..."
            required
            disabled={submitting}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            disabled={submitting}
            rows={4}
            className="w-full px-3 py-2 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save' : 'Add Card')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
