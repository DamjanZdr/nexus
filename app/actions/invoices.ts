'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(
  caseId: string,
  installmentId: string,
  invoiceName: string,
  amount: number,
  dueDate?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      case_id: caseId,
      installment_id: installmentId,
      invoice_name: invoiceName,
      amount,
      due_date: dueDate || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invoice:', error)
    return { error: 'Failed to create invoice' }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true, invoice: data }
}

export async function sendInvoice(invoiceId: string, caseId: string) {
  const supabase = await createClient()

  // TODO: Integrate with Stripe to create actual invoice
  // For now, just update status to 'sent'
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) {
    console.error('Error sending invoice:', error)
    return { error: 'Failed to send invoice' }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true, invoice: data }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  caseId: string,
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
) {
  const supabase = await createClient()

  const updateData: any = { status }

  // Set paid_at when marking as paid
  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating invoice status:', error)
    return { error: 'Failed to update invoice status' }
  }

  // If invoice is paid, also mark the installment as paid
  if (status === 'paid') {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('installment_id')
      .eq('id', invoiceId)
      .single()

    if (invoice?.installment_id) {
      await supabase
        .from('installments')
        .update({ paid: true })
        .eq('id', invoice.installment_id)
    }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function deleteInvoice(invoiceId: string, caseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) {
    console.error('Error deleting invoice:', error)
    return { error: 'Failed to delete invoice' }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function getInvoicesForCase(caseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return { error: 'Failed to fetch invoices', invoices: [] }
  }

  return { invoices: data || [] }
}
