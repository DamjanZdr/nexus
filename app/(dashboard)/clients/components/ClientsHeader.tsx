'use client'

import { Button } from '@/components/ui/Button'

interface ClientsHeaderProps {
  onAddClick: () => void
}

export function ClientsHeader({ onAddClick }: ClientsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
          Clients
        </h1>
        <p className="text-[hsl(var(--color-text-secondary))] mt-2">
          Manage your clients and their information
        </p>
      </div>
      <Button onClick={onAddClick}>+ Add Client</Button>
    </div>
  )
}
