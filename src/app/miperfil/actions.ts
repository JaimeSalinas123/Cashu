'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: pref } = await supabase
    .from('user_preferences')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  // Buscamos el nombre en los metadatos de cuando creó la cuenta (por si usó "name" o "full_name")
  const nameFromSignup = user.user_metadata?.full_name || user.user_metadata?.name || ''

  return {
    email: user.email,
    // Si ya tiene un nombre guardado en preferencias lo usa, si no, usa el del registro
    name: pref?.full_name || nameFromSignup
  }
}

export async function updateProfileName(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const fullName = formData.get('full_name') as string

  const { error } = await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: user.id, 
      full_name: fullName 
    }, { onConflict: 'user_id' })

  if (error) return { error: error.message }

  revalidatePath('/miperfil')
  return { success: true }
}

export async function sendPasswordReset() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'No estás logueado' }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email)
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}