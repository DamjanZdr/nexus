'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/types/database'

interface ClientHeaderProps {
  client: Client
  onDelete: () => void
}

export function ClientHeader({ client, onDelete }: ClientHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex justify-between items-start">
      <div>
        <Button variant="ghost" onClick={() => router.push('/clients')} className="mb-4">
          ← Clients
        </Button>
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
          {client.first_name || client.last_name || client.contact_email || 'Unnamed Client'}
          {client.first_name && client.last_name && ` ${client.last_name}`}
        </h1>
        <div className="mt-2 space-y-1">
          {client.client_code && (
            <p className="text-[hsl(var(--color-text-secondary))] font-mono">
              {client.client_code}
            </p>
          )}
          <p className="text-[hsl(var(--color-text-secondary))]">
            Client since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )
}
