'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAssigneeToCase(caseId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('case_assignees')
    .insert({
      case_id: caseId,
      user_id: userId,
    })

  if (error) {
    console.error('Error adding assignee to case:', error)
    return { error: 'Failed to add assignee' }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function removeAssigneeFromCase(assigneeId: string, caseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('case_assignees')
    .delete()
    .eq('id', assigneeId)

  if (error) {
    console.error('Error removing assignee from case:', error)
    return { error: 'Failed to remove assignee' }
  }

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}
