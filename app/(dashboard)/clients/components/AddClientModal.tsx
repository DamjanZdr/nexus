'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { addClient } from '@/app/actions/clients'
import { getAllCountries, getAllCities } from '@/app/actions/locations'
import type { Country, City } from '@/types/database'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [phoneNumbers, setPhoneNumbers] = useState<Array<{ number: string; isWhatsapp: boolean }>>([{ number: '', isWhatsapp: false }])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')

  useEffect(() => {
    if (isOpen && countries.length === 0) {
      getAllCountries().then(setCountries)
      getAllCities().then(setCities)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const validPhones = phoneNumbers.filter(p => p.number.trim())

    if (!firstName?.trim() && !lastName?.trim() && !email?.trim() && validPhones.length === 0) {
      setError('Please provide at least one of: First Name, Last Name, Email, or Phone Number')
      setIsSubmitting(false)
      return
    }
    
    if (selectedCountry) formData.set('countryId', selectedCountry)
    if (selectedCity) formData.set('cityId', selectedCity)
    if (validPhones.length > 0) {
      formData.set('phoneNumbers', JSON.stringify(validPhones))
    }
    
    const result = await addClient(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      resetForm()
      onSuccess()
      onClose()
    }
  }

  const resetForm = () => {
    setIsSubmitting(false)
    setError(null)
    setPhoneNumbers([{ number: '', isWhatsapp: false }])
    setSelectedCountry('')
    setSelectedCity('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addPhoneField = () => {
    setPhoneNumbers([...phoneNumbers, { number: '', isWhatsapp: false }])
  }

  const removePhoneField = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
  }

  const updatePhoneNumber = (index: number, number: string) => {
    const updated = [...phoneNumbers]
    updated[index].number = number
    setPhoneNumbers(updated)
  }

  const updatePhoneWhatsApp = (index: number, isWhatsapp: boolean) => {
    const updated = [...phoneNumbers]
    updated[index].isWhatsapp = isWhatsapp
    setPhoneNumbers(updated)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <Input label="First Name" name="firstName" placeholder="John" />
        <Input label="Last Name" name="lastName" placeholder="Doe" />
        <Input label="Email" name="email" type="email" placeholder="john.doe@example.com" />

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Phone Numbers
          </label>
          <div className="space-y-2">
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  value={phone.number}
                  onChange={(e) => updatePhoneNumber(index, e.target.value)}
                  placeholder="+48 123 456 789"
                  className="flex-1"
                />
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={phone.isWhatsapp}
                    onChange={(e) => updatePhoneWhatsApp(index, e.target.checked)}
                    className="w-4 h-4 rounded border-[hsl(var(--color-border))]"
                  />
                  <span className="text-sm text-[hsl(var(--color-text-secondary))]">WhatsApp</span>
                </div>
                {phoneNumbers.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePhoneField(index)} className="mt-1">
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPhoneField}>
              + Add Phone
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            Country of Origin
          </label>
          <Select
            options={countries.map(c => ({ id: c.id, label: c.country }))}
            value={selectedCountry}
            onChange={setSelectedCountry}
            placeholder="Select country..."
            searchPlaceholder="Search countries..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            City in Poland
          </label>
          <Select
            options={cities.map(c => ({ id: c.id, label: c.city }))}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Select city..."
            searchPlaceholder="Search cities..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
