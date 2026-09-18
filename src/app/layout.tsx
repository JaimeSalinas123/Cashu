import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Configuramos la fuente principal de la app
const inter = Inter({ subsets: ['latin'] })

// Estos datos aparecerán en la pestaña del navegador y al compartir links
export const metadata: Metadata = {
  title: 'Cashu | Finanzas Personales',
  description: 'Controla tus gastos, ingresos y facturas de forma segura y privada.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#EAF1EC] text-[#16211B] antialiased`}>
        {/* Aquí adentro es donde Next.js inyecta tus páginas (login, signup, dashboard) */}
        {children}
      </body>
    </html>
  )
}