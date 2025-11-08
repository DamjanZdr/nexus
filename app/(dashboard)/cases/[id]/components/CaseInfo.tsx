'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import { updateCase } from '@/app/actions/cases'
import type { Case, Client, Status } from '@/types/database'

interface CaseInfoProps {
  caseData: Case
  client: Client | null
  status: Status | null
  onUpdate: () => void
}

export function CaseInfo({ caseData, client, status, onUpdate }: CaseInfoProps) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchStatuses()
  }, [])

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from('status')
      .select('*')
      .order('position', { ascending: true })
    
    if (data) setStatuses(data)
  }

  const handleUpdateStatus = async (newStatusId: string) => {
    const formData = new FormData()
    formData.set('caseId', caseData.id)
    formData.set('statusId', newStatusId)

    const result = await updateCase(formData)

    if (!result?.error) {
      onUpdate()
    }
  }

  const getClientDisplayName = () => {
    if (!client) return 'Unknown Client'
    if (client.first_name && client.last_name) return `${client.first_name} ${client.last_name}`
    if (client.first_name) return client.first_name
    if (client.last_name) return client.last_name
    if (client.contact_email) return client.contact_email
    return 'Unnamed Client'
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Case Information</h3>
      <div>
        <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-1">Client</label>
        <div>
          <p className="text-[hsl(var(--color-text-primary))]">{getClientDisplayName()}</p>
          {client?.client_code && (
            <p className="text-xs text-[hsl(var(--color-text-secondary))] font-mono mt-0.5">{client.client_code}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-1">Status</label>
        <Select
          options={statuses.map(s => ({ id: s.id, label: s.name }))}
          value={caseData.status_id || ''}
          onChange={(value) => handleUpdateStatus(value)}
          placeholder="Select status..."
          searchPlaceholder="Search statuses..."
        />
      </div>
    </div>
  )
}