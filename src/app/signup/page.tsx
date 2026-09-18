'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signup } from '../login/actions'
import Toast from '@/components/Toast' // Importamos nuestro nuevo componente

// Separamos el contenido en un componente interno para poder usar useSearchParams de forma segura en Next.js
function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estado para controlar el Toast
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  // Efecto para capturar los errores que vienen del servidor (ej: correo ya existe)
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      if (error === 'no-se-pudo-crear-cuenta') setToast({ message: 'El correo ya está registrado o hubo un error.', type: 'error' })
      else if (error === 'datos-invalidos-o-passwords-no-coinciden') setToast({ message: 'El servidor rechazó los datos ingresados.', type: 'error' })
      else setToast({ message: 'Ocurrió un error inesperado.', type: 'error' })
      
      // Limpiamos la URL para que el error no se quede pegado si recargas la página
      router.replace('/signup', { scroll: false })
    }
  }, [searchParams, router])

  // Validación Profesional en el Frontend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Evitamos que la página recargue
    const formData = new FormData(e.currentTarget)
    
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // 1. Validar Usuario: Solo letras, números y guiones bajos. Sin espacios.
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (username.length < 3) {
      return setToast({ message: 'El usuario debe tener al menos 3 caracteres.', type: 'error' })
    }
    if (!usernameRegex.test(username)) {
      return setToast({ message: 'El usuario no puede contener espacios ni símbolos especiales.', type: 'error' })
    }

    // 2. Validar longitud de la contraseña
    if (password.length < 8) {
      return setToast({ message: 'La contraseña debe tener un mínimo de 8 caracteres.', type: 'error' })
    }

    // 3. Confirmar que las contraseñas son idénticas
    if (password !== confirmPassword) {
      return setToast({ message: 'Las contraseñas no coinciden. Revísalas.', type: 'error' })
    }

    // Si todo es perfecto, enviamos los datos a la acción del servidor
    await signup(formData)
  }

  return (
    <div className="min-h-screen bg-[#EAF1EC] font-sans text-[#16211B] flex flex-col items-center justify-center p-4">
      {/* Nuestro Toast flotante */}
      <Toast message={toast?.message || ''} type={toast?.type} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="Cashu" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-semibold tracking-tight">CASHU</span>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white border border-[#DCE8DF] p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Crear cuenta</h2>
          <p className="mt-1.5 text-sm text-[#5B6B60]">Comienza a controlar tus finanzas hoy</p>
        </div>

        {/* Cambiamos el action por onSubmit para ejecutar nuestras validaciones primero */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-[#33443A]">Nombre de Usuario</label>
            <input
              id="username" name="username" type="text" required placeholder="ej. carlos_finanzas"
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#33443A]">Correo Electrónico</label>
            <input
              id="email" name="email" type="email" required placeholder="tu@correo.com"
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#33443A]">Contraseña</label>
            <div className="relative">
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 pr-11 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#5B6B60] transition-colors">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#33443A]">Confirmar Contraseña</label>
            <div className="relative">
              <input
                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 pr-11 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#5B6B60] transition-colors">
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="mt-2 rounded-xl bg-[#1F3D2C] p-3 text-white font-medium hover:bg-[#16301F] transition-colors">
            Crear cuenta
          </button>

          <p className="text-center text-sm text-[#5B6B60] mt-1">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#3FA66C] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

// Next.js requiere que useSearchParams esté envuelto en Suspense
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EAF1EC]" />}>
      <SignupForm />
    </Suspense>
  )
}