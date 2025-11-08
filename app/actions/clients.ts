'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addClient(formData: FormData) {
  const supabase = await createClient()

  const data = {
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    contact_email: formData.get('email') as string,
    contact_number: formData.get('phone') as string,
  }

  const { error } = await supabase
    .from('clients')
    .insert([data])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    contact_email: formData.get('email') as string,
    contact_number: formData.get('phone') as string,
  }

  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}
