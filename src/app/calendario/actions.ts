'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ----- POST-ITS -----
export async function getCalendarPostits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase.from('calendar_postits').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
  return data || []
}

export async function addPostit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const date_id = formData.get('date_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string || 'yellow'

  const { error } = await supabase.from('calendar_postits').insert({ user_id: user.id, date_id, title, description, color })
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

export async function updatePostit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string || 'yellow'

  const { error } = await supabase.from('calendar_postits').update({ title, description, color }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

export async function deletePostit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('calendar_postits').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

export async function movePostit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const new_date_id = formData.get('new_date_id') as string

  const { error } = await supabase.from('calendar_postits').update({ date_id: new_date_id }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

// ----- RECORDATORIOS -----
export async function getCalendarReminders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase.from('calendar_reminders').select('*').eq('user_id', user.id).order('time', { ascending: true })
  return data || []
}

export async function addReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const date_id = formData.get('date_id') as string
  const time = formData.get('time') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('calendar_reminders').insert({ user_id: user.id, date_id, time, title, description })
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

export async function deleteReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('calendar_reminders').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}