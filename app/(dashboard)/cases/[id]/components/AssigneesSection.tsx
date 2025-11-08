'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { addAssigneeToCase, removeAssigneeFromCase } from '@/app/actions/assignees'
import type { User } from '@/types/database'

interface AssigneeWithUser {
  id: string
  user_id: string
  users?: User
}

interface AssigneesSectionProps {
  caseId: string
  assignees: AssigneeWithUser[]
  onUpdate: () => void
}

export function AssigneesSection({ caseId, assignees, onUpdate }: AssigneesSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isAddModalOpen && users.length === 0) {
      fetchUsers()
    }
  }, [isAddModalOpen])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('display_name', { ascending: true })
    
    if (data) setUsers(data)
  }

  const handleAdd = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    const result = await addAssigneeToCase(caseId, selectedUser)

    if (!result?.error) {
      setSelectedUser('')
      setIsAddModalOpen(false)
      onUpdate()
    }
    setSubmitting(false)
  }

  const handleRemove = async (assigneeId: string) => {
    if (!confirm('Remove this assignee?')) return

    await removeAssigneeFromCase(assigneeId, caseId)
    onUpdate()
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">Assigned To</label>
        {assignees.length === 0 ? (
          <p className="text-[hsl(var(--color-text-secondary))] text-sm mb-2">No assignees</p>
        ) : (
          <div className="space-y-2 mb-2">
            {assignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center justify-between p-2 rounded border border-[hsl(var(--color-border))]">
                <span className="text-[hsl(var(--color-text-primary))]">{assignee.users?.display_name || assignee.users?.email}</span>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(assignee.id)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)} className="w-full">+ Add Assignee</Button>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Assignee">
        <div className="space-y-4">
          <Select
            options={users.filter(u => !assignees.some(a => a.user_id === u.id)).map(u => ({ id: u.id, label: u.display_name || u.email }))}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Select user..."
            searchPlaceholder="Search users..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting || !selectedUser}>
              {submitting ? 'Adding...' : 'Add Assignee'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}