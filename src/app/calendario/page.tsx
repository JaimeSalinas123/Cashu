'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { getCalendarPostits, addPostit, updatePostit, deletePostit, movePostit, getCalendarReminders, addReminder, deleteReminder } from './actions'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

const Icons = {
  Back: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Plus: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Bell: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}

const POSTIT_COLORS: Record<string, string> = {
  yellow: 'bg-[#FEF08A] text-[#854D0E] border-[#FDE047]',
  pink: 'bg-[#FBCFE8] text-[#831843] border-[#F9A8D4]',
  blue: 'bg-[#BFDBFE] text-[#1E3A8A] border-[#93C5FD]',
  green: 'bg-[#BBF7D0] text-[#14532D] border-[#86EFAC]',
}

const getLocalYYYYMMDD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function CalendarioPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date()) 
  const [postits, setPostits] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null)

  const [formType, setFormType] = useState<'postit' | 'recordatorio'>('postit')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  
  const [formHour, setFormHour] = useState('12')
  const [formMinute, setFormMinute] = useState('00')
  const [formAmPm, setFormAmPm] = useState('PM')

  const loadData = async () => {
    setIsLoading(true)
    const pData = await getCalendarPostits()
    const rData = await getCalendarReminders()
    setPostits(pData)
    setReminders(rData)
    setIsLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const resetForm = () => {
    setEditingId(null)
    setFormTitle('')
    setFormDesc('')
    setSelectedColor('yellow')
    setFormHour('12')
    setFormMinute('00')
    setFormAmPm('PM')
  }

  const openDayModal = (dateId: string) => {
    setSelectedDate(dateId)
    setIsModalOpen(true)
    resetForm()
  }

  const startEditing = (postit: any) => {
    setFormType('postit')
    setEditingId(postit.id)
    setFormTitle(postit.title)
    setFormDesc(postit.description || '')
    setSelectedColor(postit.color)
  }

  const get24HourFormat = () => {
    let hNum = parseInt(formHour, 10) || 12
    if (formAmPm === 'PM' && hNum < 12) hNum += 12
    if (formAmPm === 'AM' && hNum === 12) hNum = 0
    return `${String(hNum).padStart(2, '0')}:${String(formMinute).padStart(2, '0')}`
  }

  const handleSaveItem = async (formData: FormData) => {
    if (formType === 'postit') {
      if (editingId) {
        const res = await updatePostit(formData)
        if (res?.error) alert(`Error: ${res.error}`)
      } else {
        const res = await addPostit(formData)
        if (res?.error) alert(`Error: ${res.error}`)
      }
    } else {
      formData.set('time', get24HourFormat())
      const res = await addReminder(formData)
      if (res?.error) alert(`Error: ${res.error}`)
    }
    await loadData()
    resetForm()
  }

  const handleDeleteItem = async (id: string, type: 'postit' | 'recordatorio') => {
    const formData = new FormData()
    formData.append('id', id)
    
    if (type === 'postit') {
      await deletePostit(formData)
      if (editingId === id) resetForm()
    } else {
      await deleteReminder(formData)
    }
    await loadData()
  }

  // DRAG & DROP POSTITS
  const handleDragStart = (e: React.DragEvent, postitId: string) => {
    e.dataTransfer.setData('postitId', postitId)
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.4' }, 0)
  }
  const handleDragEnd = (e: React.DragEvent) => { (e.target as HTMLElement).style.opacity = '1'; setDraggedOverDate(null) }
  const handleDragOver = (e: React.DragEvent, dateId: string) => { e.preventDefault(); setDraggedOverDate(dateId) }
  const handleDrop = async (e: React.DragEvent, targetDateId: string) => {
    e.preventDefault()
    setDraggedOverDate(null)
    const postitId = e.dataTransfer.getData('postitId')
    if (!postitId) return
    setPostits(prev => prev.map(p => p.id === postitId ? { ...p, date_id: targetDateId } : p))
    const formData = new FormData()
    formData.append('id', postitId); formData.append('new_date_id', targetDateId)
    await movePostit(formData)
  }

  const selectedDayPostits = selectedDate ? postits.filter(p => p.date_id === selectedDate) : []
  const selectedDayReminders = selectedDate ? reminders.filter(r => r.date_id === selectedDate) : []
  const displaySelectedDate = selectedDate ? `${selectedDate.split('-')[2]} de ${MONTH_NAMES[Number(selectedDate.split('-')[1]) - 1]}` : ''

  if (isLoading && postits.length === 0 && reminders.length === 0) {
    return <div className="min-h-screen bg-[#EAF1EC] flex items-center justify-center"><span className="animate-spin h-6 w-6 border-2 border-[#DCE8DF] border-t-[#3FA66C] rounded-full"></span></div>
  }

  return (
    <div className={`min-h-screen bg-[#EAF1EC] text-[#16211B] antialiased ${manrope.className} flex flex-col`}>
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 py-6 md:py-10 flex-1 flex flex-col">
        
        {/* ENCABEZADO RESPONSIVE */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white text-[#5B6B60] shadow-sm hover:text-[#16211B] transition-colors">
              {Icons.Back}
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Calendario</h1>
              <p className="text-xs md:text-sm text-[#5B6B60]">Post-its y Recordatorios</p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto bg-white border border-[#DCE8DF] rounded-2xl p-1.5 shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[#F5F9F6] rounded-xl transition-colors">{Icons.ChevronLeft}</button>
            <span className="font-bold flex-1 md:w-40 text-center text-base md:text-lg">{MONTH_NAMES[month]} {year}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-[#F5F9F6] rounded-xl transition-colors">{Icons.ChevronRight}</button>
          </div>
        </header>

        <div className="flex-1 bg-white border border-[#DCE8DF] rounded-2xl md:rounded-[32px] shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-[#DCE8DF] bg-[#F5F9F6]">
            {WEEK_DAYS.map(day => <div key={day} className="text-center text-[10px] md:text-xs font-bold text-[#A0B0A5] py-3 md:py-4 uppercase truncate">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-[#DCE8DF] gap-px">
            {emptyDays.map(empty => <div key={`empty-${empty}`} className="bg-white/50"></div>)}
            
            {monthDays.map(day => {
              const dateId = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateId === getLocalYYYYMMDD(new Date())
              const dayPostits = postits.filter(p => p.date_id === dateId)
              const dayReminders = reminders.filter(r => r.date_id === dateId)
              const isDraggedOver = draggedOverDate === dateId

              return (
                <div 
                  key={dateId} 
                  onClick={() => openDayModal(dateId)}
                  onDragOver={(e) => handleDragOver(e, dateId)}
                  onDragLeave={() => setDraggedOverDate(null)}
                  onDrop={(e) => handleDrop(e, dateId)}
                  className={`p-1 md:p-3 flex flex-col gap-1 cursor-pointer transition-colors group relative min-h-[90px] md:min-h-[120px] ${
                    isDraggedOver ? 'bg-[#E3F3EA] border-2 border-dashed border-[#3FA66C]' : 'bg-white hover:bg-[#F9FBF9]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-0.5 md:mb-1">
                    <span className={`text-[11px] md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#3FA66C] text-white shadow-md' : 'text-[#5B6B60]'}`}>
                      {day}
                    </span>
                    <span className="opacity-0 hidden md:block group-hover:opacity-100 text-[#A0B0A5] transition-opacity">
                      {Icons.Plus}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 md:gap-1.5 overflow-hidden">
                    {/* Render Recordatorios (Campanitas) */}
                    {dayReminders.slice(0, 2).map((rem) => (
                      <div key={rem.id} className="bg-[#1F3D2C] text-white flex items-center gap-1 p-0.5 md:p-1 px-1 md:px-2 rounded-[4px] md:rounded-md shadow-sm text-[9px] md:text-[11px] font-bold truncate">
                        <span className="text-[#7FD3A3] scale-75 md:scale-100">{Icons.Bell}</span> <span className="truncate">{rem.time}</span>
                      </div>
                    ))}

                    {/* Render Post-its */}
                    {dayPostits.slice(0, 3).map((postit, index) => {
                      const rotateClass = index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                      const colorClass = POSTIT_COLORS[postit.color] || POSTIT_COLORS.yellow
                      return (
                        <div key={postit.id} draggable onDragStart={(e) => handleDragStart(e, postit.id)} onDragEnd={handleDragEnd} onClick={(e) => e.stopPropagation()} 
                          className={`${colorClass} ${rotateClass} border p-1 md:p-1.5 rounded shadow-sm text-[9px] md:text-xs font-semibold truncate hover:scale-105 hover:z-10 cursor-grab active:cursor-grabbing`}>
                          {postit.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {Array.from({ length: (7 - ((emptyDays.length + monthDays.length) % 7)) % 7 }).map((_, i) => <div key={`end-empty-${i}`} className="bg-white/50"></div>)}
          </div>
        </div>
      </div>

      {/* MODAL: VER Y AGREGAR */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16211B]/40 backdrop-blur-sm p-3 md:p-4">
          <div className="w-full max-w-3xl rounded-2xl md:rounded-[32px] bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] md:max-h-[85vh]">
            
            {/* Columna Izquierda: Contenido del día */}
            <div className="flex-1 bg-[#F5F9F6] p-5 md:p-8 overflow-y-auto max-h-[45vh] md:max-h-none border-b md:border-b-0 md:border-r border-[#DCE8DF]">
              <div className="mb-4 md:mb-6"><h3 className="text-xl md:text-2xl font-bold text-[#16211B]">{displaySelectedDate}</h3></div>

              {selectedDayReminders.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h4 className="text-[10px] md:text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-3">Recordatorios (Con alarma)</h4>
                  {selectedDayReminders.map(rem => (
                    <div key={rem.id} className="bg-white border border-[#DCE8DF] p-3 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#1F3D2C] text-white text-xs font-bold px-2 py-1 rounded-md">{rem.time}</span>
                        <div>
                          <p className="font-bold text-sm">{rem.title}</p>
                          {rem.description && <p className="text-xs text-[#5B6B60]">{rem.description}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteItem(rem.id, 'recordatorio')} className="text-[#A0B0A5] hover:text-red-500 p-1.5"><span className="scale-90">{Icons.Trash}</span></button>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayPostits.length > 0 && (
                <div className="space-y-3 md:space-y-4">
                  <h4 className="text-[10px] md:text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-2">Post-its (Notas visuales)</h4>
                  {selectedDayPostits.map(postit => {
                    const colorClass = POSTIT_COLORS[postit.color] || POSTIT_COLORS.yellow
                    return (
                      <div key={postit.id} className={`${colorClass} border p-3 md:p-4 rounded-xl shadow-md relative group`}>
                        <h4 className="font-bold text-[14px] md:text-[15px] mb-1 pr-16">{postit.title}</h4>
                        {postit.description && <p className="text-xs md:text-sm opacity-90 whitespace-pre-wrap">{postit.description}</p>}
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex gap-1 md:opacity-0 group-hover:opacity-100">
                          <button onClick={() => startEditing(postit)} className="p-1 md:p-1.5 hover:bg-black/10 rounded-lg bg-white/20 md:bg-transparent">{Icons.Edit}</button>
                          <button onClick={() => handleDeleteItem(postit.id, 'postit')} className="p-1 md:p-1.5 hover:bg-black/10 rounded-lg bg-white/20 md:bg-transparent">{Icons.Trash}</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedDayPostits.length === 0 && selectedDayReminders.length === 0 && (
                <div className="text-center py-8 md:py-10 opacity-60"><p className="text-lg">📭</p><p className="text-sm font-medium mt-2">Día libre.</p></div>
              )}
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="w-full md:w-[340px] p-5 md:p-8 bg-white flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
                <h3 className="text-lg font-bold">{editingId ? 'Editar Post-it' : 'Crear nuevo'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#A0B0A5] hover:text-[#16211B] bg-[#F5F9F6] p-2 rounded-xl">Cerrar</button>
              </div>

              {!editingId && (
                <div className="flex bg-[#F5F9F6] p-1 rounded-xl mb-5 md:mb-6 shrink-0">
                  <button onClick={() => setFormType('postit')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${formType === 'postit' ? 'bg-white shadow-sm' : 'text-[#5B6B60]'}`}>Post-it</button>
                  <button onClick={() => setFormType('recordatorio')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${formType === 'recordatorio' ? 'bg-white shadow-sm' : 'text-[#5B6B60]'}`}>Recordatorio</button>
                </div>
              )}

              <form action={handleSaveItem} className="flex flex-col flex-1 shrink-0">
                <input type="hidden" name="date_id" value={selectedDate} />
                {editingId && <input type="hidden" name="id" value={editingId} />}
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-[#33443A] mb-1.5">Título</label>
                    <input type="text" name="title" required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ej: Pagar luz" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C] font-semibold text-sm md:text-base" />
                  </div>
                  
                  {formType === 'recordatorio' && (
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-[#33443A] mb-1.5">Hora de Alarma</label>
                      <div className="flex items-center gap-2">
                        <input type="hidden" name="time" value="00:00" /> 
                        <div className="flex flex-1 items-center bg-[#F5F9F6] border border-[#DCE8DF] rounded-xl focus-within:border-[#3FA66C] px-3 py-2 transition-colors">
                          <input 
                            type="text" 
                            maxLength={2}
                            value={formHour} 
                            onChange={e => setFormHour(e.target.value.replace(/\D/g, ''))} 
                            onBlur={() => {
                              let val = parseInt(formHour, 10);
                              if (isNaN(val) || val < 1) val = 12;
                              if (val > 12) val = 12;
                              setFormHour(String(val).padStart(2, '0'));
                            }}
                            className="w-full bg-transparent text-center text-lg md:text-xl font-bold outline-none text-[#16211B] placeholder:text-[#A0B0A5]" 
                            placeholder="12"
                          />
                          <span className="text-lg md:text-xl font-bold text-[#A0B0A5] pb-1">:</span>
                          <input 
                            type="text" 
                            maxLength={2}
                            value={formMinute} 
                            onChange={e => setFormMinute(e.target.value.replace(/\D/g, ''))} 
                            onBlur={() => {
                              let val = parseInt(formMinute, 10);
                              if (isNaN(val) || val < 0) val = 0;
                              if (val > 59) val = 59;
                              setFormMinute(String(val).padStart(2, '0'));
                            }}
                            className="w-full bg-transparent text-center text-lg md:text-xl font-bold outline-none text-[#16211B] placeholder:text-[#A0B0A5]" 
                            placeholder="00"
                          />
                        </div>

                        <div className="flex bg-[#F5F9F6] border border-[#DCE8DF] rounded-xl p-1 shrink-0">
                          <button 
                            type="button" 
                            onClick={() => setFormAmPm('AM')}
                            className={`px-2 py-2 text-xs font-bold rounded-lg transition-colors ${formAmPm === 'AM' ? 'bg-white shadow-sm text-[#16211B]' : 'text-[#5B6B60]'}`}
                          >
                            AM
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFormAmPm('PM')}
                            className={`px-2 py-2 text-xs font-bold rounded-lg transition-colors ${formAmPm === 'PM' ? 'bg-white shadow-sm text-[#16211B]' : 'text-[#5B6B60]'}`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-[#33443A] mb-1.5">Detalles (Opcional)</label>
                    <textarea name="description" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Agrega notas adicionales..." className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C] resize-none text-xs md:text-sm font-medium" />
                  </div>
                  
                  {formType === 'postit' && (
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-[#33443A] mb-2">Color</label>
                      <input type="hidden" name="color" value={selectedColor} />
                      <div className="flex gap-3">
                        {Object.keys(POSTIT_COLORS).map(color => (
                          <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full shadow-sm border-2 ${selectedColor === color ? 'border-[#16211B] scale-110' : 'border-transparent'}`} style={{ backgroundColor: color === 'yellow' ? '#FEF08A' : color === 'pink' ? '#FBCFE8' : color === 'blue' ? '#BFDBFE' : '#BBF7D0' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <button type="submit" className="w-full rounded-xl bg-[#1F3D2C] py-3 text-sm font-bold text-white hover:bg-[#16301F] shadow-sm transition-colors">
                    {editingId ? 'Actualizar Post-it' : formType === 'postit' ? 'Pegar Post-it' : 'Crear Recordatorio'}
                  </button>
                  {editingId && <button type="button" onClick={resetForm} className="w-full rounded-xl bg-[#F5F9F6] py-3 text-sm font-bold text-[#5B6B60]">Cancelar edición</button>}
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}