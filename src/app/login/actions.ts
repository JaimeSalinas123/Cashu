'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { z } from 'zod'

/// 🛡️ ESQUEMAS DE SEGURIDAD (ZOD)
const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase().max(255),
  password: z.string().min(1).max(100),
})

const signupSchema = z.object({
  // Relajamos un poco el username temporalmente
  username: z.string().trim().min(3).max(50), 
  email: z.string().email().trim().toLowerCase().max(255),
  password: z.string().min(6).max(100), // Bajamos a 6 para probar
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Validar y limpiar lo que envió el cliente (Evita inyección de campos)
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // Si envían basura o no cumple el formato, los rechazamos sin tocar la BD
  if (!parsed.success) redirect('/login?error=datos-invalidos')

  const { email, password } = parsed.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  
  // 2. Mensaje genérico: No decimos si el correo existe o si fue la contraseña
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
  
  // Si el correo ya existe, Supabase devuelve error, pero nosotros damos un mensaje genérico
  if (error) redirect('/signup?error=no-se-pudo-crear-cuenta')

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Cuando hagan clic en el correo, los mandamos a nuestra ruta secreta y de ahí a cambiar la contraseña
    redirectTo: `http://localhost:3000/auth/callback?next=/update-password`,
  })

  if (error) redirect('/forgot-password?error=hubo-un-problema')
  
  // Si todo sale bien, lo dejamos en la misma página pero le mostramos un aviso de éxito
  redirect('/forgot-password?success=correo-enviado')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  // Actualizamos la contraseña del usuario que está logueado temporalmente por el enlace
  const { error } = await supabase.auth.updateUser({ password })

  if (error) redirect('/update-password?error=no-se-pudo-actualizar')
  
  redirect('/login?success=contrasena-actualizada')
}