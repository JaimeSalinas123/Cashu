'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server' // Ojo: Si este archivo está en src/app/actions.ts, cámbialo a '../lib/supabase/server'
import { z } from 'zod'

// ==========================================
// 🛡️ ESQUEMAS DE SEGURIDAD (ZOD)
// ==========================================

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase().max(255),
  password: z.string().min(1).max(100),
})

const signupSchema = z.object({
  username: z.string().trim().min(3).max(50), 
  email: z.string().email().trim().toLowerCase().max(255),
  password: z.string().min(6).max(100),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

// ==========================================
// 🔐 AUTENTICACIÓN (Login, Registro, Recuperación)
// ==========================================

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Validar y limpiar lo que envió el cliente
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // Si envían basura o no cumple el formato, los rechazamos sin tocar la BD
  if (!parsed.success) redirect('/login?error=datos-invalidos')

  const { email, password } = parsed.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  
  // 2. Mensaje genérico por seguridad
  if (error) redirect('/login?error=credenciales-invalidas')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // 1. Validar, normalizar y checar que las contraseñas coincidan
  const parsed = signupSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    console.log("ERRORES DE VALIDACIÓN ZOD:", parsed.error.format())
    redirect('/signup?error=datos-invalidos-o-passwords-no-coinciden')
  }

  const { email, password, username } = parsed.data

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { username: username }
    }
  })
  
  if (error) redirect('/signup?error=no-se-pudo-crear-cuenta')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Ruta secreta de callback
    redirectTo: `http://localhost:3000/auth/callback?next=/update-password`,
  })

  if (error) redirect('/forgot-password?error=hubo-un-problema')
  
  redirect('/forgot-password?success=correo-enviado')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  // Actualizamos la contraseña del usuario logueado temporalmente
  const { error } = await supabase.auth.updateUser({ password })

  if (error) redirect('/update-password?error=no-se-pudo-actualizar')
  
  redirect('/login?success=contrasena-actualizada')
}

// ==========================================
// 🎛️ DASHBOARD Y PREFERENCIAS DE USUARIO
// ==========================================

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Lee los módulos que el usuario guardó en su perfil
export async function getPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('user_preferences')
    .select('active_widgets')
    .eq('user_id', user.id)
    .single()

  if (data) return data.active_widgets || []
  return []
}

// Actualiza los módulos en la base de datos de forma silenciosa
export async function updatePreferences(widgets: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // upsert: actualiza si existe, crea si no existe
  await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: user.id, 
      active_widgets: widgets 
    }, { onConflict: 'user_id' })
}