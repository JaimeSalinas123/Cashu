import { createClient } from '../lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Obtenemos los datos del usuario logueado
  const { data: { user } } = await supabase.auth.getUser()

  // Protección extra: si no hay usuario, de vuelta al login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#EAF1EC] p-8 font-sans text-[#16211B] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-10 shadow-sm border border-[#DCE8DF] text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">¡Bienvenido a Cashu! 🚀</h1>
        
        <p className="mb-8 text-[#5B6B60]">
          Sesión iniciada correctamente con el correo:<br/>
          <strong className="text-[#1F3D2C] text-lg mt-2 inline-block">{user.email}</strong>
        </p>

        <form action={logout}>
          <button className="rounded-xl bg-red-50 px-6 py-3 font-medium text-red-600 hover:bg-red-100 transition-colors">
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}