'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logout, getPreferences, updatePreferences } from './login/actions'

const Icons = {
  Finanzas: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>,
  Agenda: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  Calorias: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Calendario: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Recordatorios: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  User: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Plus: <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
}

// Removí "miperfil" de aquí para que sea una tarjeta permanente abajo
const AVAILABLE_WIDGETS = [
  { id: 'finanzas', title: 'Finanzas', icon: Icons.Finanzas },
  { id: 'agenda', title: 'Agenda', icon: Icons.Agenda },
  { id: 'contadorcalorias', title: 'Calorías', icon: Icons.Calorias },
  { id: 'calendario', title: 'Calendario', icon: Icons.Calendario },
  { id: 'recordatorios', title: 'Recordatorios', icon: Icons.Recordatorios },
]

export default function DashboardPage() {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const savedWidgets = await getPreferences()
      setActiveWidgets(savedWidgets)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const toggleWidget = async (widgetId: string) => {
    let newWidgets = []
    if (activeWidgets.includes(widgetId)) {
      newWidgets = activeWidgets.filter(id => id !== widgetId)
    } else {
      newWidgets = [...activeWidgets, widgetId]
    }
    setActiveWidgets(newWidgets) 
    await updatePreferences(newWidgets) 
  }

  const visibleWidgets = AVAILABLE_WIDGETS.filter(w => activeWidgets.includes(w.id))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EAF1EC] flex items-center justify-center">
        <span className="text-[#5B6B60] font-medium animate-pulse">Cargando tu espacio...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EAF1EC] p-6 md:p-12 font-sans text-[#16211B] flex justify-center items-center">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Módulos dinámicos */}
          {visibleWidgets.map((widget) => (
            <Link 
              href={`/${widget.id}`} 
              key={widget.id} 
              className="group aspect-square relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-6 shadow-sm border border-[#DCE8DF] transition-all hover:border-[#3FA66C] hover:shadow-md cursor-pointer"
            >
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleWidget(widget.id)
                }}
                className="absolute right-4 top-4 text-[#A0B0A5] hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Quitar módulo"
              >
                {Icons.Trash}
              </button>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F9F6] text-[#1F3D2C] transition-transform group-hover:scale-110 duration-300">
                {widget.icon}
              </div>
              <span className="font-semibold text-[#16211B]">{widget.title}</span>
            </Link>
          ))}

          {/* Mi Perfil (Moviéndose al final, justo antes de "Agregar") */}
          <Link 
            href="/miperfil"
            className="group aspect-square relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#1F3D2C] p-6 shadow-sm border border-[#16301F] transition-all hover:shadow-md cursor-pointer"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:scale-110 duration-300">
              {Icons.User}
            </div>
            <span className="font-semibold text-white">Mi Perfil</span>
          </Link>

          {/* Botón Agregar */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="aspect-square flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-[#A0B0A5] bg-transparent text-[#5B6B60] hover:bg-white hover:border-[#3FA66C] hover:text-[#3FA66C] transition-all"
          >
            {Icons.Plus}
            <span className="font-medium">Agregar</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16211B]/20 backdrop-blur-md p-4 transition-opacity">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl border border-[#DCE8DF]">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-[#16211B]">Agregar Módulo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A0B0A5] hover:text-[#16211B] bg-[#F5F9F6] p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {AVAILABLE_WIDGETS.map((widget) => {
                const isActive = activeWidgets.includes(widget.id)
                return (
                  <div key={widget.id} className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${isActive ? 'border-[#3FA66C] bg-[#F5F9F6]' : 'border-[#DCE8DF] hover:border-[#A0B0A5]'}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-[#1F3D2C]">
                        {widget.icon}
                      </div>
                      <span className="font-medium text-[#16211B]">{widget.title}</span>
                    </div>
                    <button 
                      onClick={() => toggleWidget(widget.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-white text-red-500 border border-red-200 hover:bg-red-50' : 'bg-[#1F3D2C] text-white hover:bg-[#16301F]'}`}
                    >
                      {isActive ? 'Quitar' : 'Agregar'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}