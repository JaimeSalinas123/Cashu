'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { updatePassword } from '../login/actions'
import Toast from '@/components/Toast'

function UpdatePasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password.length < 8) return setToast({ message: 'Mínimo 8 caracteres.', type: 'error' })
    if (password !== confirmPassword) return setToast({ message: 'Las contraseñas no coinciden.', type: 'error' })

    await updatePassword(formData)
  }

  return (
    <div className="min-h-screen bg-[#EAF1EC] font-sans text-[#16211B] flex flex-col items-center justify-center p-4">
      <Toast message={toast?.message || ''} type={toast?.type} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="Cashu" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-semibold tracking-tight">CASHU</span>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white border border-[#DCE8DF] p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Nueva Contraseña</h2>
          <p className="mt-1.5 text-sm text-[#5B6B60]">Escribe tu nueva contraseña segura.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#33443A]">Nueva Contraseña</label>
            <div className="relative">
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 pr-11 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5]">
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#33443A]">Confirmar Contraseña</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required placeholder="Repite la contraseña"
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors"
            />
          </div>

          <button type="submit" className="mt-2 rounded-xl bg-[#1F3D2C] p-3 text-white font-medium hover:bg-[#16301F] transition-colors">
            Actualizar y Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EAF1EC]" />}>
      <UpdatePasswordForm />
    </Suspense>
  )
}