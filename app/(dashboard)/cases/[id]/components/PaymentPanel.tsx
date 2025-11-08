'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { addInstallment, updateInstallment, deleteInstallment, mergeInstallments } from '@/app/actions/installments'
import { createInvoice, sendInvoice, updateInvoiceStatus, deleteInvoice, getInvoicesForCase } from '@/app/actions/invoices'
import type { Installment, Invoice } from '@/types/database'

interface PaymentPanelProps {
  caseId: string
  installments: Installment[]
  services: any[]
  onUpdate: () => void
}

export function PaymentPanel({ caseId, installments, services, onUpdate }: PaymentPanelProps) {
  const [localInstallments, setLocalInstallments] = useState<Record<string, { amount: string; due_date: string }>>({})
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sendInvoiceModalOpen, setSendInvoiceModalOpen] = useState(false)
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    const initial: Record<string, { amount: string; due_date: string }> = {}
    installments.forEach(inst => {
      initial[inst.id] = {
        amount: (inst.amount ?? 0).toString(),
        due_date: inst.due_date || ''
      }
    })
    setLocalInstallments(initial)
  }, [installments])

  useEffect(() => {
    fetchInvoices()
  }, [caseId])

  async function fetchInvoices() {
    const result = await getInvoicesForCase(caseId)
    if (result.invoices) {
      setInvoices(result.invoices)
    }
  }

  const handleBlur = async (installmentId: string, field: 'amount' | 'due_date') => {
    const installment = installments.find(i => i.id === installmentId)
    if (!installment) return

    const localData = localInstallments[installmentId]
    if (!localData) return

    const formData = new FormData()
    formData.set('amount', localData.amount)
    formData.set('dueDate', localData.due_date)
    formData.set('automaticInvoice', installment.automatic_invoice.toString())

    await updateInstallment(installmentId, caseId, formData)
    onUpdate()
  }

  const handleCheckboxChange = async (installmentId: string, checked: boolean) => {
    const installment = installments.find(i => i.id === installmentId)
    if (!installment) return

    const formData = new FormData()
    formData.set('amount', installment.amount?.toString() ?? '0')
    formData.set('dueDate', installment.due_date || '')
    formData.set('automaticInvoice', checked.toString())

    await updateInstallment(installmentId, caseId, formData)
    onUpdate()
  }

  const handleLocalChange = (installmentId: string, field: 'amount' | 'due_date', value: string) => {
    setLocalInstallments(prev => ({
      ...prev,
      [installmentId]: {
        ...prev[installmentId],
        [field]: value
      }
    }))
  }

  const handleAdd = async () => {
    await addInstallment(caseId, 0)
    onUpdate()
  }

  const handleMerge = async (installmentId: string) => {
    await mergeInstallments(installmentId, caseId)
    onUpdate()
  }

  const handleDelete = async (installmentId: string) => {
    setSelectedInstallmentId(installmentId)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedInstallmentId) return

    setSubmitting(true)
    const result = await deleteInstallment(selectedInstallmentId, caseId)
    if (result?.error) {
      alert(result.error)
    } else {
      onUpdate()
    }
    setSubmitting(false)
    setDeleteModalOpen(false)
    setSelectedInstallmentId(null)
  }

  const handleSendInvoice = async (installmentId: string) => {
    setSelectedInstallmentId(installmentId)
    setSendInvoiceModalOpen(true)
  }

  const confirmSendInvoice = async () => {
    if (!selectedInstallmentId) return
    
    setSubmitting(true)
    
    try {
      const installment = installments.find(i => i.id === selectedInstallmentId)
      if (!installment) return

      // Generate invoice name from services and installment
      const serviceNames = services.map(s => s.services?.name).filter(Boolean).join(', ') || 'Services'
      const installmentIndex = installments.findIndex(i => i.id === selectedInstallmentId)
      const installmentName = installment.is_down_payment 
        ? 'Down Payment' 
        : `Installment ${installmentIndex + 1}`
      const invoiceName = `${serviceNames} - ${installmentName}`

      // Create the invoice
      const createResult = await createInvoice(
        caseId,
        selectedInstallmentId,
        invoiceName,
        installment.amount,
        installment.due_date
      )

      if (createResult.error) {
        alert(createResult.error)
        return
      }

      // Send the invoice (update status to 'sent')
      if (createResult.invoice) {
        const sendResult = await sendInvoice(createResult.invoice.id, caseId)
        if (sendResult.error) {
          alert(sendResult.error)
          return
        }
      }

      // Refresh invoices and update parent
      await fetchInvoices()
      onUpdate()
    } catch (err) {
      console.error('Error sending invoice:', err)
      alert('Failed to send invoice')
    } finally {
      setSubmitting(false)
      setSendInvoiceModalOpen(false)
      setSelectedInstallmentId(null)
    }
  }

  const totalAmount = installments.reduce((sum, inst) => {
    const amount = inst.amount !== null && inst.amount !== undefined ? parseFloat(inst.amount.toString()) : 0
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Draft' },
      sent: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Sent' },
      viewed: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Viewed' },
      paid: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Paid' },
      overdue: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Overdue' },
      cancelled: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Cancelled' },
    }
    const style = styles[status] || styles.draft
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${style.bg} ${style.text} text-xs font-medium`}>
        {style.label}
      </span>
    )
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    setSubmitting(true)
    await updateInvoiceStatus(invoiceId, caseId, 'paid')
    await fetchInvoices()
    onUpdate()
    setSubmitting(false)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <div className="text-sm text-[hsl(var(--color-text-secondary))]">
            Total: <span className="font-bold text-[hsl(var(--color-text-primary))]">{totalAmount.toFixed(2)} PLN</span>
          </div>
        </div>
        <div className="space-y-3">
            {installments.map((installment, index) => (
              <div key={installment.id} className="p-3 rounded border border-[hsl(var(--color-border))] space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                      {installment.is_down_payment ? 'Down Payment' : `Installment ${index + 1}`}
                    </span>
                    {installment.paid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Paid
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => handleMerge(installment.id)} title="Merge with above">
                        ↑
                      </Button>
                    )}
                    {!installment.is_down_payment && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(installment.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 min-w-0">
                    <Input
                      type="number"
                      value={localInstallments[installment.id]?.amount ?? '0'}
                      onChange={(e) => handleLocalChange(installment.id, 'amount', e.target.value)}
                      onBlur={() => handleBlur(installment.id, 'amount')}
                      placeholder="Amount"
                      className="text-sm"
                    />
                  </div>
                  <div className="w-[135px] shrink-0">
                    <Input
                      type="date"
                      value={localInstallments[installment.id]?.due_date ?? ''}
                      onChange={(e) => handleLocalChange(installment.id, 'due_date', e.target.value)}
                      onBlur={() => handleBlur(installment.id, 'due_date')}
                      className="text-sm cursor-pointer"
                    />
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0">
                    <input
                      type="checkbox"
                      checked={installment.automatic_invoice}
                      onChange={(e) => handleCheckboxChange(installment.id, e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] checked:bg-[hsl(var(--color-primary))] checked:border-[hsl(var(--color-primary))] cursor-pointer"
                    />
                    <span className="text-xs text-[hsl(var(--color-text-secondary))]">Auto Invoice</span>
                  </label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSendInvoice(installment.id)}
                    className="text-xs whitespace-nowrap shrink-0"
                  >
                    Send Invoice
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
              + Add Installment
            </Button>

            {/* Invoices Section */}
            <div className="mt-6 pt-6 border-t border-[hsl(var(--color-border))]">
            <h3 className="text-sm font-semibold mb-3 text-[hsl(var(--color-text-primary))]">Invoices</h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-[hsl(var(--color-text-secondary))] text-center py-4">
                No invoices sent yet
              </p>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-3 rounded border border-[hsl(var(--color-border))]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[hsl(var(--color-text-primary))] truncate">
                            {invoice.invoice_number || 'Pending'}
                          </span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-xs text-[hsl(var(--color-text-secondary))] truncate">
                          {invoice.invoice_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-sm font-bold text-[hsl(var(--color-text-primary))]">
                          {invoice.amount.toFixed(2)} PLN
                        </div>
                        {invoice.due_date && (
                          <div className="text-xs text-[hsl(var(--color-text-secondary))]">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-[hsl(var(--color-text-secondary))]">
                      <span>
                        {invoice.sent_at 
                          ? `Sent ${new Date(invoice.sent_at).toLocaleDateString()}`
                          : 'Not sent yet'}
                      </span>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={submitting}
                          className="text-xs h-6"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Installment">
        <div className="space-y-4">
          <p>Are you sure you want to delete this installment?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={confirmDelete} disabled={submitting} className="bg-red-500 hover:bg-red-600 text-white">
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={sendInvoiceModalOpen} onClose={() => setSendInvoiceModalOpen(false)} title="Send Invoice">
        <div className="space-y-4">
          <p>Are you sure you want to send the invoice for this installment?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSendInvoiceModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={confirmSendInvoice} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}