'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addServiceToCase(caseId: string, serviceId: string) {
  const supabase = await createClient()

  // Get the service details to get the price
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('gross_price')
    .eq('id', serviceId)
    .single()

  if (serviceError) {
    console.error('Error fetching service:', serviceError)
    return { error: 'Failed to fetch service details' }
  }

  // Add the service to the case
  const { error } = await supabase
    .from('case_services')
    .insert({
      case_id: caseId,
      service_id: serviceId,
    })

  if (error) {
    console.error('Error adding service to case:', error)
    return { error: 'Failed to add service' }
  }

  // If the service has a price, add it to the down payment installment
  if (service?.gross_price && service.gross_price > 0) {
    // Get the down payment installment
    const { data: downPayment, error: dpError } = await supabase
      .from('installments')
      .select('id, amount')
      .eq('case_id', caseId)
      .eq('is_down_payment', true)
      .single()

    if (!dpError && downPayment) {
      // Update the down payment amount
      const currentAmount = downPayment.amount || 0
      const newAmount = currentAmount + service.gross_price

      await supabase
        .from('installments')
        .update({ amount: newAmount })
        .eq('id', downPayment.id)
    }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function removeServiceFromCase(caseServiceId: string, caseId: string) {
  const supabase = await createClient()

  // Get the case service to get the service details
  const { data: caseService, error: csError } = await supabase
    .from('case_services')
    .select('service_id, services(gross_price)')
    .eq('id', caseServiceId)
    .single()

  if (csError) {
    console.error('Error fetching case service:', csError)
    return { error: 'Failed to fetch service details' }
  }

  // Delete the case service
  const { error } = await supabase
    .from('case_services')
    .delete()
    .eq('id', caseServiceId)

  if (error) {
    console.error('Error removing service from case:', error)
    return { error: 'Failed to remove service' }
  }

  // If the service had a price, subtract it from the down payment
  const servicePrice = (caseService as any)?.services?.gross_price
  if (servicePrice && servicePrice > 0) {
    // Get the down payment installment
    const { data: downPayment, error: dpError } = await supabase
      .from('installments')
      .select('id, amount')
      .eq('case_id', caseId)
      .eq('is_down_payment', true)
      .single()

    if (!dpError && downPayment) {
      // Update the down payment amount
      const currentAmount = downPayment.amount || 0
      const newAmount = Math.max(0, currentAmount - servicePrice)

      await supabase
        .from('installments')
        .update({ amount: newAmount })
        .eq('id', downPayment.id)
    }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function getAllServices() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}
