'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from './actions'
import Toast from '@/components/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  // Atrapamos los errores o mensajes de éxito desde la URL
  useEffect(() => {
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      if (error === 'credenciales-invalidas') {
        setToast({ message: 'Correo o contraseña incorrectos.', type: 'error' })
      } else {
        setToast({ message: 'Ocurrió un error inesperado.', type: 'error' })
      }
      router.replace('/login', { scroll: false })
    }

    if (success) {
      if (success === 'contrasena-actualizada') {
        setToast({ message: '¡Contraseña actualizada con éxito!', type: 'success' })
      }
      router.replace('/login', { scroll: false })
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-[#EAF1EC] font-sans text-[#16211B] flex flex-col items-center justify-center p-4">
      {/* Notificación flotante */}
      <Toast message={toast?.message || ''} type={toast?.type} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="Cashu" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-semibold tracking-tight">CASHU</span>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white border border-[#DCE8DF] p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
          <p className="mt-1.5 text-sm text-[#5B6B60]">Ingresa tus datos para continuar</p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#33443A]">Correo Electrónico</label>
            <input
              id="email" name="email" type="email" required placeholder="ejemplo@correo.com"
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-[#33443A]">Contraseña</label>
              <Link href="/forgot-password" className="text-sm text-[#3FA66C] hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="relative">
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 pr-11 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#5B6B60] transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button formAction={login} className="mt-2 rounded-xl bg-[#1F3D2C] p-3 text-white font-medium hover:bg-[#16301F] transition-colors">
            Iniciar Sesión
          </button>

          <p className="text-center text-sm text-[#5B6B60] mt-1">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-[#3FA66C] font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

// Next.js requiere que useSearchParams esté envuelto en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EAF1EC]" />}>
      <LoginForm />
    </Suspense>
  )
}