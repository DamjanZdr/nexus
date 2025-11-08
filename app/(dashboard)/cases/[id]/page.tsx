'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { deleteCase } from '@/app/actions/cases'
import { CaseHeader } from './components/CaseHeader'
import { CaseInfo } from './components/CaseInfo'
import { ServicesSection } from './components/ServicesSection'
import { AssigneesSection } from './components/AssigneesSection'
import { PaymentPanel } from './components/PaymentPanel'
import type { Case, Client, Status, Installment } from '@/types/database'

interface CasePageProps {
  params: Promise<{ id: string }>
}

export default function CasePage({ params }: CasePageProps) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [assignees, setAssignees] = useState<any[]>([])
  const [caseServices, setCaseServices] = useState<any[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCaseData()
  }, [params])

  async function fetchCaseData() {
    const { id } = await params
    setLoading(true)

    let caseResult, caseError
    
    if (id.startsWith('C')) {
      const result = await supabase.from('cases').select('*').eq('case_code', id).single()
      caseResult = result.data
      caseError = result.error
    } else {
      const result = await supabase.from('cases').select('*').eq('id', id).single()
      caseResult = result.data
      caseError = result.error
    }

    if (caseError || !caseResult) {
      console.error('Error fetching case:', caseError)
      setLoading(false)
      return
    }

    setCaseData(caseResult)

    if (caseResult.client_id) {
      const { data: clientData } = await supabase.from('clients').select('*').eq('id', caseResult.client_id).single()
      if (clientData) setClient(clientData)
    }

    if (caseResult.status_id) {
      const { data: statusData } = await supabase.from('status').select('*').eq('id', caseResult.status_id).single()
      if (statusData) setStatus(statusData)
    }

    const { data: assigneesData } = await supabase.from('case_assignees').select('*, users(*)').eq('case_id', caseResult.id)
    if (assigneesData) setAssignees(assigneesData)

    const { data: servicesData } = await supabase.from('case_services').select('*, services(*)').eq('case_id', caseResult.id)
    if (servicesData) setCaseServices(servicesData)

    const { data: installmentsData } = await supabase.from('installments').select('*').eq('case_id', caseResult.id).order('position', { ascending: true })
    if (installmentsData) setInstallments(installmentsData)

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!caseData) return
    setSubmitting(true)
    const result = await deleteCase(caseData.id)
    if (!result?.error) {
      router.push('/cases')
    } else {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>
  if (!caseData) return <div className="flex items-center justify-center min-h-screen"><p>Case not found</p></div>

  return (
    <div className="space-y-6">
      <CaseHeader caseData={caseData} client={client} onDelete={() => setIsDeleteModalOpen(true)} />
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Case">
        <div className="space-y-4">
          <p>Are you sure you want to delete this case? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-red-500 hover:bg-red-600 text-white">{submitting ? 'Deleting...' : 'Delete Case'}</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <CaseInfo caseData={caseData} client={client} status={status} onUpdate={fetchCaseData} />
              <div className="border-t border-[hsl(var(--color-border))] pt-6">
                <h3 className="text-lg font-semibold mb-4">Services & Assignees</h3>
                <div className="space-y-6">
                  <AssigneesSection caseId={caseData.id} assignees={assignees} onUpdate={fetchCaseData} />
                  <ServicesSection caseId={caseData.id} caseServices={caseServices} onUpdate={fetchCaseData} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent><div className="text-center py-12"><p>Document management coming soon</p></div></CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <PaymentPanel caseId={caseData.id} installments={installments} services={caseServices} onUpdate={fetchCaseData} />
        </div>
      </div>
    </div>
  )
}
