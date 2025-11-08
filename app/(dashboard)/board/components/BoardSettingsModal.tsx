'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateBoard, deleteBoard } from '@/app/actions/boards'
import { Board } from '@/types/database'

interface BoardSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  board: Board | null
  onUpdate: () => void
}

export function BoardSettingsModal({ isOpen, onClose, board, onUpdate }: BoardSettingsModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (board) {
      setName(board.name)
      setDescription(board.description || '')
    }
    setError(null)
  }, [board, isOpen])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!board) return

    setSubmitting(true)
    setError(null)

    const result = await updateBoard(board.id, { name, description })

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSubmitting(false)
      onUpdate()
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!board) return
    if (!confirm(`Are you sure you want to delete "${board.name}"? This cannot be undone.`)) return

    setSubmitting(true)
    const result = await deleteBoard(board.id)

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      router.push('/board')
      onUpdate()
      onClose()
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setError(null)
      onClose()
    }
  }

  if (!board) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Board Settings">
      <form onSubmit={handleUpdate} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Board Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter board name..."
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this board for?"
            disabled={submitting}
            rows={3}
            className="w-full px-3 py-2 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] disabled:opacity-50"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[hsl(var(--color-border))]">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={submitting}
            className="text-red-500 hover:text-red-600"
          >
            Delete Board
          </Button>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
