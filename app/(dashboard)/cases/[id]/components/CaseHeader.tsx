'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { Case, Client } from '@/types/database'

interface CaseHeaderProps {
  caseData: Case
  client: Client | null
  onDelete: () => void
}

export function CaseHeader({ caseData, client, onDelete }: CaseHeaderProps) {
  const router = useRouter()

  const getClientDisplayName = () => {
    if (!client) return 'Unknown Client'
    if (client.first_name && client.last_name) return `${client.first_name} ${client.last_name}`
    if (client.first_name) return client.first_name
    if (client.last_name) return client.last_name
    if (client.contact_email) return client.contact_email
    return 'Unnamed Client'
  }

  return (
    <div className="flex justify-between items-start">
      <div>
        {/* Breadcrumb Navigation - matches client page style */}
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/clients')}
          >
            ← Clients
          </Button>
          {client && (
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/clients/${client.client_code || client.id}`)}
            >
              ← {getClientDisplayName()} {client.client_code && `(${client.client_code})`}
            </Button>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
          {caseData.case_code || 'Case Details'}
        </h1>
        <p className="text-[hsl(var(--color-text-secondary))] text-sm mt-2">
          Created {new Date(caseData.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onDelete} className="text-red-500 hover:bg-red-500/10">
          Delete Case
        </Button>
      </div>
    </div>
  )
}