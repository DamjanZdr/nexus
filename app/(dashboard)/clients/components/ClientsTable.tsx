'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Client } from '@/types/database'

interface ClientWithPhones extends Client {
  contact_numbers?: Array<{ id: string; number: string; is_on_whatsapp: boolean }>
}

interface ClientsTableProps {
  clients: ClientWithPhones[]
  loading: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function ClientsTable({ clients, loading, loadingMore, onLoadMore }: ClientsTableProps) {
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const tableRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.2) {
        onLoadMore()
      }
    }

    const scrollElement = tableRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [onLoadMore])

  const filteredClients = clients.filter((client) => {
    if (!filters.firstName && !filters.lastName && !filters.email && !filters.phone) {
      return true
    }

    const matchesFirstName = !filters.firstName || client.first_name?.toLowerCase().includes(filters.firstName.toLowerCase())
    const matchesLastName = !filters.lastName || client.last_name?.toLowerCase().includes(filters.lastName.toLowerCase())
    const matchesEmail = !filters.email || client.contact_email?.toLowerCase().includes(filters.email.toLowerCase())
    const matchesPhone = !filters.phone || client.contact_numbers?.some(phone => 
      phone.number.toLowerCase().includes(filters.phone.toLowerCase())
    )

    return matchesFirstName && matchesLastName && matchesEmail && matchesPhone
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-[hsl(var(--color-text-secondary))]">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Clients (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-[hsl(var(--color-text-secondary))]">
              No clients yet. Click "Add Client" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clients ({filteredClients.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={tableRef} className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-[hsl(var(--color-surface))] z-10">
              <tr className="border-b border-[hsl(var(--color-border))]">
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium w-24"></th>
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium">
                  <div className="space-y-2">
                    <div>First Name</div>
                    <Input
                      placeholder="Search..."
                      value={filters.firstName}
                      onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </th>
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium">
                  <div className="space-y-2">
                    <div>Last Name</div>
                    <Input
                      placeholder="Search..."
                      value={filters.lastName}
                      onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </th>
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium">
                  <div className="space-y-2">
                    <div>Phone Number(s)</div>
                    <Input
                      placeholder="Search..."
                      value={filters.phone}
                      onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </th>
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium">
                  <div className="space-y-2">
                    <div>Email</div>
                    <Input
                      placeholder="Search..."
                      value={filters.email}
                      onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </th>
                <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-surface-hover))] transition-colors"
                >
                  <td className="p-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/clients/${client.client_code || client.id}`)}
                      className="cursor-pointer hover:bg-[hsl(var(--color-primary))]/10 hover:text-[hsl(var(--color-primary))]"
                    >
                      Open
                    </Button>
                  </td>
                  <td className="p-4 text-[hsl(var(--color-text-primary))]">
                    {client.first_name || '-'}
                  </td>
                  <td className="p-4 text-[hsl(var(--color-text-primary))]">
                    {client.last_name || '-'}
                  </td>
                  <td className="p-4 text-[hsl(var(--color-text-primary))]">
                    {client.contact_numbers && client.contact_numbers.length > 0 ? (
                      <div className="space-y-1">
                        {client.contact_numbers.map((phone) => (
                          <div key={phone.id} className="flex items-center gap-2">
                            <span>{phone.number}</span>
                            {phone.is_on_whatsapp && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                                WhatsApp
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-4 text-[hsl(var(--color-text-primary))]">
                    {client.contact_email || '-'}
                  </td>
                  <td className="p-4 text-[hsl(var(--color-text-secondary))] text-sm">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loadingMore && (
            <div className="text-center py-4">
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">Loading more...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
