'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/database'

interface ClientPageProps {
  params: Promise<{ id: string }>
}

export default function ClientPage({ params }: ClientPageProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [countryName, setCountryName] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchClient() {
      const { id } = await params
      setLoading(true)

      // Fetch client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (clientError) {
        console.error('Error fetching client:', clientError)
        setLoading(false)
        return
      }

      setClient(clientData)

      // Fetch country name if exists
      if (clientData.country_of_origin) {
        const { data: countryData } = await supabase
          .from('countries')
          .select('country')
          .eq('id', clientData.country_of_origin)
          .single()
        
        if (countryData) {
          setCountryName(countryData.country)
        }
      }

      // Fetch city name if exists
      if (clientData.city_in_poland) {
        const { data: cityData } = await supabase
          .from('cities')
          .select('city')
          .eq('id', clientData.city_in_poland)
          .single()
        
        if (cityData) {
          setCityName(cityData.city)
        }
      }

      setLoading(false)
    }

    fetchClient()
  }, [params])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-[hsl(var(--color-text-secondary))]">Loading client...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <p className="text-[hsl(var(--color-text-secondary))]">Client not found</p>
        <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/clients')}
            className="mb-4"
          >
            ← Back to Clients
          </Button>
          <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-[hsl(var(--color-text-secondary))] mt-2">
            Client since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Client</Button>
          <Button variant="ghost">Delete</Button>
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                Full Name
              </label>
              <p className="text-[hsl(var(--color-text-primary))] mt-1">
                {client.first_name} {client.last_name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                Email Address
              </label>
              <p className="text-[hsl(var(--color-text-primary))] mt-1">
                {client.contact_email || '-'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                Phone Number
              </label>
              <p className="text-[hsl(var(--color-text-primary))] mt-1">
                {client.contact_number || '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                Country of Origin
              </label>
              <p className="text-[hsl(var(--color-text-primary))] mt-1">
                {countryName || '-'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                City in Poland
              </label>
              <p className="text-[hsl(var(--color-text-primary))] mt-1">
                {cityName || '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Cases</CardTitle>
            <Button size="sm">+ Add Case</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))] text-center py-8">
            No cases yet for this client
          </p>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <Button size="sm">+ Upload Document</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))] text-center py-8">
            No documents uploaded yet
          </p>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notes</CardTitle>
            <Button size="sm">+ Add Note</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))] text-center py-8">
            No notes yet
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
