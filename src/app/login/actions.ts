'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=credenciales-invalidas')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Pasamos el username a los metadatos del usuario en Supabase
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        username: username,
      }
    }
  })
  
  if (error) redirect('/login?error=no-se-pudo-crear-cuenta')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:3000/auth/callback`,
    },
  })

  // Esto redirige al usuario a la pantalla de Google para elegir su cuenta
  if (data.url) {
    redirect(data.url)
  }
}