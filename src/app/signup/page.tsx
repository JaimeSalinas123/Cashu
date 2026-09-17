import Image from 'next/image'
import Link from 'next/link'
import { signup } from '../login/actions'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#EAF1EC] font-sans text-[#16211B] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="Cashu" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-semibold tracking-tight">CASHU</span>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white border border-[#DCE8DF] p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Crear cuenta</h2>
          <p className="mt-1.5 text-sm text-[#5B6B60]">Comienza a controlar tus finanzas hoy</p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-[#33443A]">
              Nombre de Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#33443A]">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#33443A]">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 text-[#16211B] outline-none focus:border-[#3FA66C] focus:bg-white transition-colors"
            />
          </div>

          <button
            formAction={signup}
            className="mt-2 rounded-xl bg-[#1F3D2C] p-3 text-white font-medium hover:bg-[#16301F] transition-colors"
          >
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