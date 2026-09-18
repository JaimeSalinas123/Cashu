'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '../login/actions'
import Toast from '@/components/Toast'

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) setToast({ message: 'Hubo un problema al enviar el correo.', type: 'error' })
    if (success) setToast({ message: '¡Revisa tu bandeja de entrada! Te enviamos un enlace.', type: 'success' })
    
    if (error || success) router.replace('/forgot-password', { scroll: false })
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-[#EAF1EC] font-sans text-[#16211B] flex flex-col items-center justify-center p-4">
      <Toast message={toast?.message || ''} type={toast?.type} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="Cashu" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-semibold tracking-tight">CASHU</span>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white border border-[#DCE8DF] p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Recuperar cuenta</h2>
          <p className="mt-1.5 text-sm text-[#5B6B60]">Te enviaremos un enlace seguro para restablecer tu contraseña.</p>
        </div>

        <form action={resetPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#33443A]">Correo Electrónico</label>
            <input
              id="email" name="email" type="email" required placeholder="tu@correo.com"
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors placeholder:text-[#A0B0A5]"
            />
          </div>

          <button type="submit" className="mt-2 rounded-xl bg-[#1F3D2C] p-3 text-white font-medium hover:bg-[#16301F] transition-colors">
            Enviar enlace
          </button>

          <p className="text-center text-sm text-[#5B6B60] mt-1">
            <Link href="/login" className="text-[#3FA66C] font-medium hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EAF1EC]" />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}