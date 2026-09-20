'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { getAgendaNotes, saveAgendaNote } from './actions'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

// Catálogo de Íconos Profesionales SVG
const Icons = {
  Back: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Save: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Bold: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Italic: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  Underline: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  Strike: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>,
  List: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Palette: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
}

const getLocalYYYYMMDD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function AgendaPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notesData, setNotesData] = useState<any[]>([])
  
  const [currentDate, setCurrentDate] = useState(new Date()) 
  const [selectedDateId, setSelectedDateId] = useState<string>(getLocalYYYYMMDD(new Date())) 
  
  const [noteContent, setNoteContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  
  const editorRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    const data = await getAgendaNotes()
    setNotesData(data)
    
    const currentNote = data.find((n: any) => n.date_id === selectedDateId)
    const content = currentNote ? currentNote.content : ''
    setNoteContent(content)
    setOriginalContent(content)
    
    if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectDay = (dateId: string) => {
    setSelectedDateId(dateId)
    const note = notesData.find((n: any) => n.date_id === dateId)
    const content = note ? note.content : ''
    setNoteContent(content)
    setOriginalContent(content)
    if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
  }

  const handleSave = async (formData: FormData) => {
    setIsSaving(true)
    const res = await saveAgendaNote(formData)
    if (res?.error) {
      alert(`Error al guardar: ${res.error}`)
    } else {
      await loadData()
    }
    setIsSaving(false)
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    if (editorRef.current) setNoteContent(editorRef.current.innerHTML)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const [sYear, sMonth, sDay] = selectedDateId.split('-').map(Number)
  const displaySelectedDate = `${sDay} de ${MONTH_NAMES[sMonth - 1]}, ${sYear}`
  
  const hasChanges = noteContent !== originalContent

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-[#EAF1EC] ${manrope.className}`}>
        <div className="flex items-center gap-3 text-[#5B6B60]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8DF] border-t-[#3FA66C]" />
          <span className="text-sm font-medium">Cargando agenda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#EAF1EC] text-[#16211B] antialiased ${manrope.className}`}>
      
      {/* Estilos CSS Inyectados para formatear el contenido Editable */}
      <style dangerouslySetInnerHTML={{__html: `
        .editor-prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .editor-prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .editor-prose b, .editor-prose strong { font-weight: 700; }
        .editor-prose i, .editor-prose em { font-style: italic; }
        .editor-prose u { text-decoration: underline; }
        .editor-prose strike, .editor-prose s { text-decoration: line-through; }
        .editor-prose *:empty::before { content: "\\feff"; }
        /* Placeholder CSS personalizado */
        .editor-prose:empty::before {
          content: 'Empieza a escribir aquí...';
          color: #A0B0A5;
          pointer-events: none;
        }
      `}} />

      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white text-[#5B6B60] shadow-sm transition-colors hover:text-[#16211B]">
            {Icons.Back}
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">Agenda Personal</h1>
            <p className="text-sm text-[#5B6B60]">Organiza tus días y pensamientos</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* COLUMNA 1: CALENDARIO */}
          <section className="lg:col-span-1 rounded-[28px] border border-[#DCE8DF] bg-white p-6 shadow-sm flex flex-col h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold tracking-tight">{MONTH_NAMES[month]} {year}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] transition-colors">
                  {Icons.ChevronLeft}
                </button>
                <button onClick={handleNextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] transition-colors">
                  {Icons.ChevronRight}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEK_DAYS.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-[#A0B0A5] py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(empty => <div key={`empty-${empty}`} className="h-10"></div>)}
              {monthDays.map(day => {
                const dateId = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isSelected = selectedDateId === dateId
                const isToday = dateId === getLocalYYYYMMDD(new Date())
                const hasNote = notesData.some((n: any) => n.date_id === dateId && n.content.trim() !== '')

                return (
                  <button
                    key={dateId}
                    onClick={() => handleSelectDay(dateId)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-[#1F3D2C] text-white shadow-md' 
                        : isToday
                          ? 'bg-[#E3F3EA] text-[#2b754b] hover:bg-[#DCE8DF]'
                          : 'text-[#5B6B60] hover:bg-[#F5F9F6] hover:text-[#16211B]'
                    }`}
                  >
                    {day}
                    {hasNote && <span className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#3FA66C]'}`}></span>}
                  </button>
                )
              })}
            </div>
          </section>

          {/* COLUMNA 2: HOJA DE NOTAS (RICH TEXT EDITOR) */}
          <section className="lg:col-span-2 rounded-[28px] border border-[#DCE8DF] bg-white shadow-sm flex flex-col min-h-[500px] overflow-hidden">
            <form action={handleSave} className="flex flex-col h-full">
              <input type="hidden" name="date_id" value={selectedDateId} />
              <input type="hidden" name="content" value={noteContent} />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#16211B]">{displaySelectedDate}</h2>
                  <p className="text-sm text-[#5B6B60] mt-1">Escribe las tareas o pensamientos del día.</p>
                </div>
                <button
                  type="submit"
                  disabled={!hasChanges || isSaving}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                    hasChanges
                      ? 'bg-[#3FA66C] text-white shadow-sm hover:bg-[#2b754b]'
                      : 'bg-[#F5F9F6] text-[#A0B0A5] cursor-not-allowed border border-[#DCE8DF]'
                  }`}
                >
                  {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <span className="shrink-0">{Icons.Save}</span>}
                  {isSaving ? 'Guardando' : 'Guardar'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 border-y border-[#DCE8DF] bg-[#F5F9F6] px-6 py-2.5 overflow-x-auto">
                <button type="button" onClick={() => applyFormat('bold')} className="p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors" title="Negrita">{Icons.Bold}</button>
                <button type="button" onClick={() => applyFormat('italic')} className="p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors" title="Cursiva">{Icons.Italic}</button>
                <button type="button" onClick={() => applyFormat('underline')} className="p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors" title="Subrayado">{Icons.Underline}</button>
                <button type="button" onClick={() => applyFormat('strikeThrough')} className="p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors" title="Tachar">{Icons.Strike}</button>
                <div className="w-px h-5 bg-[#DCE8DF] mx-1"></div>
                <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors" title="Lista">{Icons.List}</button>
                <div className="w-px h-5 bg-[#DCE8DF] mx-1"></div>
                <label className="relative p-2 text-[#5B6B60] hover:bg-[#DCE8DF] hover:text-[#16211B] rounded-lg transition-colors cursor-pointer" title="Color del texto">
                  {Icons.Palette}
                  <input type="color" onChange={(e) => applyFormat('foreColor', e.target.value)} className="absolute opacity-0 w-0 h-0" />
                </label>
              </div>

              {/* Área Editable sin placeholder nativo (se maneja con CSS) */}
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                className="editor-prose flex-1 p-6 md:p-8 outline-none text-[15px] leading-relaxed text-[#16211B] min-h-[300px] overflow-y-auto"
                style={{ minHeight: '300px' }}
              />
            </form>
          </section>

        </div>
      </div>
    </div>
  )
}