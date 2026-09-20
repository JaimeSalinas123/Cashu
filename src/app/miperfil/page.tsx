'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { getUserProfile, updateProfileName, sendPasswordReset, signOut } from './actions'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

const Icons = {
  Back: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  User: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Key: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>,
  LogOut: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
}

export default function MiPerfilPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({ email: '', name: '' })
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const data = await getUserProfile()
      setProfile({ email: data.email || '', name: data.name })
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSaveName = async (formData: FormData) => {
    setIsSaving(true)
    const newName = formData.get('full_name') as string
    
    const res = await updateProfileName(formData)
    
    if (res?.error) {
      alert(`Error: ${res.error}`)
    } else {
      // Actualizamos el estado de la pantalla al instante
      setProfile(prev => ({ ...prev, name: newName }))
    }
    
    setIsSaving(false)
  }

  const handlePasswordReset = async () => {
    setResetMessage('Enviando...')
    const res = await sendPasswordReset()
    if (res?.error) {
      setResetMessage(`Error: ${res.error}`)
    } else {
      setResetMessage('¡Correo enviado! Revisa tu bandeja de entrada.')
    }
    setTimeout(() => setResetMessage(''), 5000)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#EAF1EC] flex items-center justify-center"><span className="animate-spin h-6 w-6 border-2 border-[#DCE8DF] border-t-[#3FA66C] rounded-full"></span></div>
  }

  return (
    <div className={`min-h-screen bg-[#EAF1EC] text-[#16211B] antialiased ${manrope.className} flex flex-col items-center justify-center p-6`}>
      <div className="w-full max-w-lg">
        
        <header className="mb-6 flex items-center gap-4">
          <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white text-[#5B6B60] shadow-sm hover:text-[#16211B] transition-colors">
            {Icons.Back}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        </header>

        <div className="bg-white border border-[#DCE8DF] rounded-[32px] p-8 shadow-sm">
          
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E3F3EA] text-[#2b754b] mb-4 shadow-inner">
              {Icons.User}
            </div>
            {/* Título central para mostrar tu nombre grande */}
            <h2 className="text-xl font-bold text-[#16211B] mb-2">{profile.name || 'Sin nombre'}</h2>
            <div className="flex items-center gap-2 text-[#5B6B60] bg-[#F5F9F6] px-4 py-2 rounded-full border border-[#DCE8DF]">
              {Icons.Mail}
              <span className="text-sm font-medium">{profile.email}</span>
            </div>
          </div>

          <hr className="border-[#DCE8DF] mb-8" />

          <form action={handleSaveName} className="mb-8">
            <label className="block text-sm font-bold text-[#33443A] mb-2">Nombre Completo</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                name="full_name" 
                defaultValue={profile.name} 
                placeholder="Ej: Juan Pérez" 
                className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C] font-medium"
              />
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#1F3D2C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#16301F] transition-colors disabled:opacity-70"
              >
                {isSaving ? '...' : 'Guardar'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-2">Seguridad y Acceso</h3>
            
            <button 
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[#DCE8DF] bg-white hover:bg-[#F5F9F6] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#5B6B60]">{Icons.Key}</span>
                <span className="font-semibold">Recuperar / Cambiar Contraseña</span>
              </div>
              <span className="text-xs text-[#5B6B60] font-medium bg-[#EAF1EC] px-2 py-1 rounded-md">Enviar correo</span>
            </button>
            
            {resetMessage && (
              <p className="text-sm font-medium text-[#3FA66C] text-center mt-2">{resetMessage}</p>
            )}

            <form action={signOut}>
              <button 
                type="submit" 
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors text-left mt-4 text-red-600"
              >
                <span>{Icons.LogOut}</span>
                <span className="font-bold">Cerrar Sesión</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}