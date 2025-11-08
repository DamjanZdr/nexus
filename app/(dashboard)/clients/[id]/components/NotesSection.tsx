'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { addNote, deleteNote, togglePinNote } from '@/app/actions/notes'
import type { ClientNote } from '@/types/database'

interface NotesSectionProps {
  clientId: string
  notes: ClientNote[]
  onUpdate: () => void
}

export function NotesSection({ clientId, notes, onUpdate }: NotesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setSubmitting(true)
    setError(null)
    const result = await addNote(clientId, newNote)
    
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    
    setNewNote('')
    setIsModalOpen(false)
    onUpdate()
    setSubmitting(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    
    setDeleting(true)
    const result = await deleteNote(noteToDelete, clientId)
    if (!result?.error) {
      onUpdate()
    }
    setDeleting(false)
    setIsDeleteModalOpen(false)
    setNoteToDelete(null)
  }

  const handleTogglePin = async (noteId: string, isPinned: boolean) => {
    const result = await togglePinNote(noteId, clientId, isPinned)
    if (!result?.error) onUpdate()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notes</CardTitle>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>+ Add Note</Button>
          </div>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-[hsl(var(--color-text-secondary))] text-center py-8">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-4 rounded-lg bg-[hsl(var(--color-surface-hover))] border border-[hsl(var(--color-border))]">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[hsl(var(--color-text-primary))] whitespace-pre-wrap break-words">{note.note}</p>
                      <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-2">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleTogglePin(note.id, note.is_pinned || false)}>
                        {note.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Note">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note..."
              className="w-full h-32 px-3 py-2 rounded-lg bg-[hsl(var(--color-input-bg))] border border-[hsl(var(--color-input-border))] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-input-focus))] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={submitting || !newNote.trim()}>
              {submitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Note">
        <div className="space-y-4">
          <p className="text-[hsl(var(--color-text-primary))]">Are you sure you want to delete this note? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Note'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
