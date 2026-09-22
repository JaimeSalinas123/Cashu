'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { getNutritionData, addFoodLog, updateFoodLog, deleteFoodLog, updateDailyBurned, deleteSavedFood, updateUserGoals } from './actions'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

const Icons = {
  Back: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Plus: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Apple: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
}

const getLocalYYYYMMDD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const MEAL_CATEGORIES = [
  { id: 'desayuno', title: 'Desayuno' },
  { id: 'almuerzo', title: 'Almuerzo' },
  { id: 'cena', title: 'Cena' },
  { id: 'merienda', title: 'Meriendas (Snacks)' }
]

export default function ContadorCaloriasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date()) 
  const dateId = getLocalYYYYMMDD(currentDate)

  const [logs, setLogs] = useState<any[]>([])
  const [savedFoods, setSavedFoods] = useState<any[]>([])
  const [dailyInfo, setDailyInfo] = useState({ burned_calories: 0 })
  const [userGoals, setUserGoals] = useState({ 
    target_calories: 2000, target_protein: 150, target_carbs: 250, target_fat: 60 
  })

  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false)
  const [isBurnedModalOpen, setIsBurnedModalOpen] = useState(false) // Solo para editar quemadas
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false) // Solo para editar metas
  
  const [foodTab, setFoodTab] = useState<'nuevo' | 'frecuentes'>('nuevo')
  const [activeMealType, setActiveMealType] = useState('desayuno')
  const [editingLog, setEditingLog] = useState<any>(null)

  const loadData = async () => {
    setIsLoading(true)
    const data = await getNutritionData(dateId)
    setLogs(data.logs)
    setSavedFoods(data.savedFoods)
    setDailyInfo(data.dailyInfo || { burned_calories: 0 })
    setUserGoals(data.userGoals || { target_calories: 2000, target_protein: 150, target_carbs: 250, target_fat: 60 })
    setIsLoading(false)
  }

  useEffect(() => { loadData() }, [dateId])

  const handlePrevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d) }
  const handleNextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d) }

  const handleSaveFood = async (formData: FormData) => {
    setIsAddFoodModalOpen(false)
    if (editingLog) {
      const res = await updateFoodLog(formData)
      if (res?.error) alert(`Error: ${res.error}`)
    } else {
      const res = await addFoodLog(formData)
      if (res?.error) alert(`Error: ${res.error}`)
    }
    setEditingLog(null)
    await loadData()
  }

  const handleUpdateDailyBurned = async (formData: FormData) => {
    setIsBurnedModalOpen(false)
    const res = await updateDailyBurned(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleUpdateGoals = async (formData: FormData) => {
    setIsGoalsModalOpen(false)
    const res = await updateUserGoals(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleDeleteLog = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    const res = await deleteFoodLog(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleDeleteSaved = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    const res = await deleteSavedFood(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const openEditModal = (log: any, mealType: string) => {
    setEditingLog(log)
    setActiveMealType(mealType)
    setFoodTab('nuevo')
    setIsAddFoodModalOpen(true)
  }

  const closeFoodModal = () => {
    setIsAddFoodModalOpen(false)
    setEditingLog(null)
  }

  const totalCals = logs.reduce((acc, curr) => acc + Number(curr.calories), 0)
  const totalProt = logs.reduce((acc, curr) => acc + Number(curr.protein), 0)
  const totalCarbs = logs.reduce((acc, curr) => acc + Number(curr.carbs), 0)
  const totalFat = logs.reduce((acc, curr) => acc + Number(curr.fat), 0)

  const netCals = totalCals - dailyInfo.burned_calories
  
  let dietStatus = 'Mantenimiento'
  let statusColor = 'bg-blue-500/20 text-blue-300' 

  if (netCals < userGoals.target_calories - 50) {
    dietStatus = 'En Déficit'
    statusColor = 'bg-[#3FA66C]/20 text-[#7FD3A3]' 
  } else if (netCals > userGoals.target_calories + 50) {
    dietStatus = 'Volumen / Superávit'
    statusColor = 'bg-red-500/20 text-red-300' 
  }
  
  const pProt = Math.min((totalProt / userGoals.target_protein) * 100, 100) || 0
  const pCarbs = Math.min((totalCarbs / userGoals.target_carbs) * 100, 100) || 0
  const pFat = Math.min((totalFat / userGoals.target_fat) * 100, 100) || 0

  const displayDate = `${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]}, ${currentDate.getFullYear()}`

  if (isLoading && logs.length === 0) {
    return <div className="min-h-screen bg-[#EAF1EC] flex items-center justify-center"><span className="animate-spin h-6 w-6 border-2 border-[#DCE8DF] border-t-[#3FA66C] rounded-full"></span></div>
  }

  return (
    <div className={`min-h-screen bg-[#EAF1EC] text-[#16211B] antialiased ${manrope.className}`}>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
        
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white text-[#5B6B60] shadow-sm hover:text-[#16211B] transition-colors">
              {Icons.Back}
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Calorías</h1>
              <p className="text-sm text-[#5B6B60]">Seguimiento diario de macros</p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between bg-white border border-[#DCE8DF] rounded-2xl p-2 mb-6 shadow-sm">
          <button onClick={handlePrevDay} className="p-2 hover:bg-[#F5F9F6] rounded-xl transition-colors">{Icons.ChevronLeft}</button>
          <span className="font-semibold">{dateId === getLocalYYYYMMDD(new Date()) ? 'Hoy' : displayDate}</span>
          <button onClick={handleNextDay} className="p-2 hover:bg-[#F5F9F6] rounded-xl transition-colors">{Icons.ChevronRight}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section className="bg-[#1F3D2C] text-white rounded-[28px] p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white/70 text-sm font-medium">Calorías Netas</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold">{netCals.toFixed(0)}</span>
                  <span className="text-white/60 text-sm">/ {userGoals.target_calories} kcal</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                {dietStatus}
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-white/60">Consumidas</p>
                <p className="font-semibold mt-0.5">{totalCals.toFixed(0)}</p>
              </div>
              {/* BOTÓN EXCLUSIVO PARA QUEMADAS */}
              <div className="border-x border-white/10 px-2 text-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsBurnedModalOpen(true)} title="Editar quemadas">
                <p className="text-xs text-white/60 flex items-center justify-center gap-1">Quemadas ✎</p>
                <p className="font-semibold mt-0.5 text-orange-300">-{dailyInfo.burned_calories}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Restantes</p>
                <p className="font-semibold mt-0.5">{Math.max(userGoals.target_calories - netCals, 0).toFixed(0)}</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#DCE8DF] rounded-[28px] p-7 shadow-sm flex flex-col justify-center gap-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-[#16211B]">Distribución de Macros</h3>
              {/* BOTÓN EXCLUSIVO PARA METAS GLOBALES */}
              <button onClick={() => setIsGoalsModalOpen(true)} className="text-xs font-medium text-[#3FA66C] hover:text-[#2b754b] transition-colors">Editar Metas</button>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-blue-600">Proteínas</span>
                <span className="text-[#5B6B60]">{totalProt.toFixed(1)} / {userGoals.target_protein}g</span>
              </div>
              <div className="h-2.5 w-full bg-[#F5F9F6] rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width: `${pProt}%`}}></div></div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-orange-500">Carbohidratos</span>
                <span className="text-[#5B6B60]">{totalCarbs.toFixed(1)} / {userGoals.target_carbs}g</span>
              </div>
              <div className="h-2.5 w-full bg-[#F5F9F6] rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full transition-all" style={{width: `${pCarbs}%`}}></div></div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-yellow-500">Grasas</span>
                <span className="text-[#5B6B60]">{totalFat.toFixed(1)} / {userGoals.target_fat}g</span>
              </div>
              <div className="h-2.5 w-full bg-[#F5F9F6] rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full transition-all" style={{width: `${pFat}%`}}></div></div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {MEAL_CATEGORIES.map(category => {
            const categoryLogs = logs.filter(l => (l.meal_type || 'merienda') === category.id)
            const catCals = categoryLogs.reduce((acc, curr) => acc + Number(curr.calories), 0)

            return (
              <section key={category.id} className="bg-white border border-[#DCE8DF] rounded-[28px] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold tracking-tight">{category.title}</h2>
                    {catCals > 0 && <span className="text-[#5B6B60] text-sm font-medium">{catCals.toFixed(0)} kcal</span>}
                  </div>
                </div>

                {categoryLogs.length > 0 && (
                  <ul className="divide-y divide-[#E6EFE9] mb-4">
                    {categoryLogs.map(log => (
                      <li key={log.id} className="py-3 px-2 flex items-center justify-between hover:bg-[#F5F9F6] rounded-xl transition-colors">
                        <div>
                          <p className="font-semibold text-[15px]">{log.name}</p>
                          <p className="text-xs text-[#5B6B60] mt-0.5 space-x-2">
                            <span className="text-blue-600 font-medium">P: {log.protein}g</span>
                            <span className="text-orange-500 font-medium">C: {log.carbs}g</span>
                            <span className="text-yellow-600 font-medium">G: {log.fat}g</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#16211B] pr-2">{log.calories} kcal</span>
                          <button onClick={() => openEditModal(log, category.id)} className="text-[#A0B0A5] hover:text-[#3FA66C] hover:bg-[#E3F3EA] p-2 rounded-lg transition-colors" title="Editar">
                            {Icons.Edit}
                          </button>
                          <button onClick={() => handleDeleteLog(log.id)} className="text-[#A0B0A5] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar">
                            {Icons.Trash}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button 
                  onClick={() => { setActiveMealType(category.id); setIsAddFoodModalOpen(true); }} 
                  className="flex items-center gap-1.5 text-[#3FA66C] hover:text-[#2b754b] text-sm font-bold transition-colors mt-2"
                >
                  {Icons.Plus} Agregar Alimento
                </button>
              </section>
            )
          })}
        </div>
      </div>

      {/* MODAL 1: SOLO CALORÍAS QUEMADAS (APLICA SOLO AL DÍA ACTUAL) */}
      {isBurnedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16211B]/30 backdrop-blur-sm p-4">
          <form action={handleUpdateDailyBurned} className="w-full max-w-xs rounded-[28px] bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Actividad de Hoy</h3>
            <p className="text-sm text-[#5B6B60] mb-6">Anota lo que quemaste hoy.</p>
            <input type="hidden" name="date_id" value={dateId} />
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#33443A] mb-1.5">Calorías Quemadas</label>
              <input type="number" name="burned" required defaultValue={dailyInfo.burned_calories} className="w-full rounded-xl border border-[#DCE8DF] bg-orange-50 p-3 text-orange-600 font-bold outline-none focus:border-orange-400" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsBurnedModalOpen(false)} className="flex-1 rounded-xl border border-[#DCE8DF] bg-white py-3 text-sm font-semibold text-[#33443A] hover:bg-[#F5F9F6]">Cancelar</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#1F3D2C] py-3 text-sm font-semibold text-white hover:bg-[#16301F]">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: SOLO METAS GLOBALES (APLICA A TODOS LOS DÍAS) */}
      {isGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16211B]/30 backdrop-blur-sm p-4">
          <form action={handleUpdateGoals} className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Mis Metas (Permanente)</h3>
            <p className="text-sm text-[#5B6B60] mb-6">Ajusta tus requerimientos diarios de macros.</p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#33443A] mb-1.5">Meta Calorías (kcal)</label>
                  <input type="number" name="target_calories" required defaultValue={userGoals.target_calories} className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C] font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1.5">Proteína (g)</label>
                  <input type="number" name="target_protein" required defaultValue={userGoals.target_protein} className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-500 mb-1.5">Carbs (g)</label>
                  <input type="number" name="target_carbs" required defaultValue={userGoals.target_carbs} className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-600 mb-1.5">Grasas (g)</label>
                  <input type="number" name="target_fat" required defaultValue={userGoals.target_fat} className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-yellow-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsGoalsModalOpen(false)} className="flex-1 rounded-xl border border-[#DCE8DF] bg-white py-3 text-sm font-semibold text-[#33443A] hover:bg-[#F5F9F6]">Cancelar</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#1F3D2C] py-3 text-sm font-semibold text-white hover:bg-[#16301F]">Guardar Global</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AGREGAR O EDITAR ALIMENTO */}
      {isAddFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16211B]/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-1">
              {editingLog ? 'Editar Alimento' : `Agregar a ${MEAL_CATEGORIES.find(c => c.id === activeMealType)?.title}`}
            </h3>
            <p className="text-sm text-[#5B6B60] mb-4">
              {editingLog ? 'Modifica las cantidades y vuelve a guardar.' : 'Añade lo que acabas de comer.'}
            </p>
            
            {!editingLog && (
              <div className="flex gap-1 bg-[#F5F9F6] p-1 rounded-xl mb-6 shrink-0">
                <button onClick={() => setFoodTab('nuevo')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${foodTab === 'nuevo' ? 'bg-white shadow-sm text-[#16211B]' : 'text-[#5B6B60]'}`}>Crear Nuevo</button>
                <button onClick={() => setFoodTab('frecuentes')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${foodTab === 'frecuentes' ? 'bg-white shadow-sm text-[#16211B]' : 'text-[#5B6B60]'}`}>Mis Comidas</button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 pr-2">
              {foodTab === 'nuevo' ? (
                <form action={handleSaveFood} className="flex flex-col h-full">
                  <input type="hidden" name="date_id" value={dateId} />
                  <input type="hidden" name="meal_type" value={activeMealType} />
                  {editingLog && <input type="hidden" name="id" value={editingLog.id} />}
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#33443A] mb-1.5">Nombre del alimento / receta</label>
                      <input type="text" name="name" required defaultValue={editingLog?.name} placeholder="Ej: Pan con huevo (2 rebanadas)" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C]" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#33443A] mb-1.5">Calorías (kcal)</label>
                        <input type="number" name="calories" required step="0.1" defaultValue={editingLog?.calories} placeholder="0" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-[#3FA66C] font-bold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-600 mb-1.5">Proteína (g)</label>
                        <input type="number" name="protein" step="0.1" defaultValue={editingLog?.protein} placeholder="0" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-500 mb-1.5">Carbs (g)</label>
                        <input type="number" name="carbs" step="0.1" defaultValue={editingLog?.carbs} placeholder="0" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-orange-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-600 mb-1.5">Grasa (g)</label>
                        <input type="number" name="fat" step="0.1" defaultValue={editingLog?.fat} placeholder="0" className="w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] p-3 outline-none focus:border-yellow-400" />
                      </div>
                    </div>

                    {!editingLog && (
                      <label className="flex items-center gap-3 mt-4 p-3 border border-[#DCE8DF] rounded-xl cursor-pointer hover:bg-[#F5F9F6] transition-colors">
                        <input type="checkbox" name="save_frequent" className="w-5 h-5 accent-[#3FA66C]" />
                        <span className="text-sm font-medium">Guardar en "Mis Comidas" para usarlo después</span>
                      </label>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto pt-4 border-t border-[#DCE8DF]">
                    <button type="button" onClick={closeFoodModal} className="flex-1 rounded-xl border border-[#DCE8DF] bg-white py-3 text-sm font-semibold hover:bg-[#F5F9F6]">Cancelar</button>
                    <button type="submit" className="flex-1 rounded-xl bg-[#3FA66C] py-3 text-sm font-semibold text-white hover:bg-[#2b754b]">
                      {editingLog ? 'Actualizar' : 'Agregar a hoy'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col h-full">
                  {savedFoods.length === 0 ? (
                    <div className="text-center py-10 text-[#5B6B60] text-sm">No tienes comidas guardadas. Crea una nueva y marca la casilla para guardarla aquí.</div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {savedFoods.map(food => (
                        <div key={food.id} className="flex items-center justify-between p-3 border border-[#DCE8DF] rounded-xl hover:bg-[#F5F9F6]">
                          <div>
                            <p className="font-semibold text-sm">{food.name}</p>
                            <p className="text-xs text-[#5B6B60] mt-0.5">{food.calories} kcal • P:{food.protein} C:{food.carbs} G:{food.fat}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleDeleteSaved(food.id)} className="text-[#A0B0A5] hover:text-red-500 bg-white border border-[#DCE8DF] p-2 rounded-lg transition-colors">
                              {Icons.Trash}
                            </button>
                            
                            <form action={handleSaveFood}>
                              <input type="hidden" name="date_id" value={dateId} />
                              <input type="hidden" name="meal_type" value={activeMealType} />
                              <input type="hidden" name="name" value={food.name} />
                              <input type="hidden" name="calories" value={food.calories} />
                              <input type="hidden" name="protein" value={food.protein} />
                              <input type="hidden" name="carbs" value={food.carbs} />
                              <input type="hidden" name="fat" value={food.fat} />
                              <button type="submit" className="bg-[#1F3D2C] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#16301F] transition-colors">
                                Agregar
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-4 border-t border-[#DCE8DF]">
                    <button type="button" onClick={closeFoodModal} className="w-full rounded-xl border border-[#DCE8DF] bg-white py-3 text-sm font-semibold hover:bg-[#F5F9F6]">Cerrar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}