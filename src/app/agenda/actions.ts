'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAgendaNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: notes, error } = await supabase
    .from('agenda_notes')
    .select('date_id, content')
    .eq('user_id', user.id)
    .order('date_id', { ascending: true })

  if (error) {
    console.error("Error obteniendo notas de la agenda:", error.message)
    return []
  }

  return notes || []
}

export async function saveAgendaNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const date_id = formData.get('date_id') as string
  const content = String(formData.get('content') ?? '').trim()

  if (!date_id) return { error: 'Falta la fecha' }

  if (content === '') {
    const { error } = await supabase
      .from('agenda_notes')
      .delete()
      .eq('user_id', user.id)
      .eq('date_id', date_id)
    
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('agenda_notes')
      .upsert({
        user_id: user.id,
        date_id: date_id,
        content: content
      }, { onConflict: 'user_id, date_id' })

    if (error) return { error: error.message }
  }

  revalidatePath('/agenda')
  return { success: true }
}