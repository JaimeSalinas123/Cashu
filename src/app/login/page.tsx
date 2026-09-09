import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-black">
      <form className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6">Cashu 💵</h1>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
          <input id="email" name="email" type="email" required className="rounded-lg border border-gray-300 p-2.5 focus:outline-blue-500" />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</label>
          <input id="password" name="password" type="password" required className="rounded-lg border border-gray-300 p-2.5 focus:outline-blue-500" />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button formAction={login} className="rounded-lg bg-black p-3 text-white font-medium hover:bg-gray-800 transition-colors">
            Iniciar Sesión
          </button>
          <button formAction={signup} className="rounded-lg border border-gray-300 p-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Crear Cuenta Segura
          </button>
        </div>
      </form>
    </div>
  )
}