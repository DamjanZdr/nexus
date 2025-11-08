'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui'
import { addServiceToCase, removeServiceFromCase, getAllServices } from '@/app/actions/services'
import type { Service } from '@/types/database'

interface ServiceWithDetails {
  id: string
  services?: Service
}

interface ServicesSectionProps {
  caseId: string
  caseServices: ServiceWithDetails[]
  onUpdate: () => void
}

export function ServicesSection({ caseId, caseServices, onUpdate }: ServicesSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAddModalOpen && services.length === 0) {
      getAllServices().then(setServices)
    }
  }, [isAddModalOpen])

  const handleAdd = async () => {
    if (!selectedService) return

    setSubmitting(true)
    const result = await addServiceToCase(caseId, selectedService)

    if (!result?.error) {
      setSelectedService('')
      setIsAddModalOpen(false)
      onUpdate()
    }
    setSubmitting(false)
  }

  const handleRemove = async (caseServiceId: string) => {
    if (!confirm('Remove this service?')) return

    await removeServiceFromCase(caseServiceId, caseId)
    onUpdate()
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">Services</label>
        {caseServices.length === 0 ? (
          <p className="text-[hsl(var(--color-text-secondary))] text-sm mb-2">No services</p>
        ) : (
          <div className="space-y-2 mb-2">
            {caseServices.map((cs) => (
              <div key={cs.id} className="flex items-center justify-between p-2 rounded border border-[hsl(var(--color-border))]">
                <div>
                  <span className="text-[hsl(var(--color-text-primary))]">{cs.services?.name}</span>
                  <span className="text-xs text-[hsl(var(--color-text-secondary))] ml-2">
                    {cs.services?.gross_price ? `${cs.services.gross_price} PLN` : 'Individual pricing'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(cs.id)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)} className="w-full">+ Add Service</Button>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Service">
        <div className="space-y-4">
          <Select
            options={services.map(s => ({ id: s.id, label: `${s.name} ${s.gross_price ? `- ${s.gross_price} PLN` : ''}` }))}
            value={selectedService}
            onChange={setSelectedService}
            placeholder="Select service..."
            searchPlaceholder="Search services..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting || !selectedService}>
              {submitting ? 'Adding...' : 'Add Service'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}