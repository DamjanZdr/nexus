'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { addClient } from '@/app/actions/clients'
import type { Client } from '@/types/database'

const CLIENTS_PER_PAGE = 20

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const supabase = createClient()
  const tableRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch initial clients
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, CLIENTS_PER_PAGE - 1)

    if (error) {
      console.error('Error fetching clients:', error)
    } else {
      setClients(data || [])
      setHasMore((data?.length || 0) === CLIENTS_PER_PAGE)
    }
    setLoading(false)
  }

  // Load more clients
  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const from = clients.length
    const to = from + CLIENTS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error loading more clients:', error)
    } else {
      setClients([...clients, ...(data || [])])
      setHasMore((data?.length || 0) === CLIENTS_PER_PAGE)
    }
    setLoadingMore(false)
  }

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current
      // Load more when scrolled to 80% of the content
      if (scrollHeight - scrollTop <= clientHeight * 1.2) {
        loadMore()
      }
    }

    const scrollElement = tableRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [clients, loadingMore, hasMore])

  // Filter clients based on search inputs
  const filteredClients = clients.filter((client) => {
    if (!filters.firstName && !filters.lastName && !filters.email && !filters.phone) {
      return true // Show all if no filters
    }

    const matchesFirstName = !filters.firstName || client.first_name?.toLowerCase().includes(filters.firstName.toLowerCase())
    const matchesLastName = !filters.lastName || client.last_name?.toLowerCase().includes(filters.lastName.toLowerCase())
    const matchesEmail = !filters.email || client.contact_email?.toLowerCase().includes(filters.email.toLowerCase())
    const matchesPhone = !filters.phone || client.contact_number?.includes(filters.phone)

    return matchesFirstName && matchesLastName && matchesEmail && matchesPhone
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await addClient(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setIsModalOpen(false)
      setIsSubmitting(false)
      // Refresh the clients list
      fetchClients()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
            Clients
          </h1>
          <p className="text-[hsl(var(--color-text-secondary))] mt-2">
            Manage your clients and their information
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Client</Button>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setError(null)
        }}
        title="Add New Client"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <Input
            label="First Name"
            name="firstName"
            required
            placeholder="John"
          />

          <Input
            label="Last Name"
            name="lastName"
            required
            placeholder="Doe"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+1 234 567 8900"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[hsl(var(--color-text-secondary))]">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[hsl(var(--color-text-secondary))]">
                No clients yet. Click "Add Client" to get started.
              </p>
            </div>
          ) : (
            <div ref={tableRef} className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-[hsl(var(--color-surface))] z-10">
                  <tr className="border-b border-[hsl(var(--color-border))]">
                    <th className="text-left p-4 text-[hsl(var(--color-text-secondary))] font-medium w-24">
                      
                    </th>
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
                      <div className="space-y-2">
                        <div>Phone</div>
                        <Input
                          placeholder="Search..."
                          value={filters.phone}
                          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
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
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          Open
                        </Button>
                      </td>
                      <td className="p-4 text-[hsl(var(--color-text-primary))]">
                        {client.first_name}
                      </td>
                      <td className="p-4 text-[hsl(var(--color-text-primary))]">
                        {client.last_name}
                      </td>
                      <td className="p-4 text-[hsl(var(--color-text-primary))]">
                        {client.contact_email || '-'}
                      </td>
                      <td className="p-4 text-[hsl(var(--color-text-primary))]">
                        {client.contact_number || '-'}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
