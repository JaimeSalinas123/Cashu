'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ------------------------------------------------------------------ */
/* Utilidades de fecha                                                 */
/* ------------------------------------------------------------------ */

// Zona horaria con la que se decide "qué día es hoy".
// Cámbiala si estás en otra zona.
const TIME_ZONE = 'America/El_Salvador'

const pad = (n: number) => String(n).padStart(2, '0')

function getToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { y: get('year'), m: get('month'), d: get('day') }
}

const todayISO = () => {
  const { y, m, d } = getToday()
  return `${y}-${pad(m)}-${pad(d)}`
}

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate() // m va de 1 a 12

const parseAmount = (value: FormDataEntryValue | null) => {
  const n = parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : null
}

// Lee una fecha "AAAA-MM-DD" (input type="date" o columna date) y la valida
function parseDateInput(value: unknown) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''))
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null
  return { y, m, d, iso: `${y}-${pad(m)}-${pad(d)}` }
}

// Siguiente fecha de un mensual: avanza al menos un mes y sigue hasta quedar después de hoy
// (por si se registró con mucho atraso). `anchorDay` conserva el día original, por ejemplo
// el 31, aunque pase por un mes más corto.
function nextOccurrence(from: { y: number; m: number }, anchorDay: number, today: string) {
  let y = from.y
  let m = from.m
  let iso: string
  do {
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
    iso = `${y}-${pad(m)}-${pad(Math.min(anchorDay, daysInMonth(y, m)))}`
  } while (iso <= today)
  return iso
}

/* ------------------------------------------------------------------ */
/* Lectura                                                             */
/* ------------------------------------------------------------------ */

export async function getFinanceData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { baseBalance: 0, transactions: [], goals: [], recurring: [], today: todayISO() }

  const { data: pref } = await supabase.from('user_preferences').select('base_balance').eq('user_id', user.id).single()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  const { data: goals } = await supabase.from('financial_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: recurring } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('user_id', user.id)
    .order('next_date', { ascending: true })

  return {
    baseBalance: pref?.base_balance || 0,
    transactions: transactions || [],
    goals: goals || [],
    recurring: recurring || [],
    // Fecha de hoy según TIME_ZONE; el cliente la usa para saber qué mensuales tocan o están atrasados
    today: todayISO(),
  }
}

/* ------------------------------------------------------------------ */
/* Balance base                                                        */
/* ------------------------------------------------------------------ */

export async function updateBaseBalance(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const amount = parseFloat(formData.get('amount') as string)

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: user.id,
    base_balance: amount
  }, { onConflict: 'user_id' })

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* Ingresos y gastos                                                   */
/* ------------------------------------------------------------------ */

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as string

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    description: description,
    amount: amount,
    type: type,
    category: 'General',
    date: todayISO()
  })

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function updateTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  const description = String(formData.get('description') ?? '').trim()
  const amount = parseAmount(formData.get('amount'))

  if (!id || !description) return { error: 'Faltan datos' }
  if (amount === null || amount <= 0) return { error: 'El monto debe ser mayor a 0' }

  const { error } = await supabase
    .from('transactions')
    .update({ description, amount })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  // Si este movimiento venía de un mensual, ese mensual vuelve a quedar pendiente este mes
  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* Ingresos y gastos mensuales (se registran con un botón)           */
/* ------------------------------------------------------------------ */

export async function addRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const description = String(formData.get('description') ?? '').trim()
  const amount = parseAmount(formData.get('amount'))
  const type = formData.get('type') as string
  const date = parseDateInput(formData.get('next_date'))

  if (!description) return { error: 'Falta la descripción' }
  if (amount === null || amount <= 0) return { error: 'El monto debe ser mayor a 0' }
  if (type !== 'ingreso' && type !== 'gasto') return { error: 'Tipo inválido' }
  if (!date) return { error: 'La fecha no es válida' }

  // day_of_month guarda el día de la fecha elegida; solo se usa internamente para
  // conservar el día original (ej. 31) al calcular las siguientes fechas.
  const { error } = await supabase.from('recurring_items').insert({
    user_id: user.id,
    description,
    amount,
    type,
    next_date: date.iso,
    day_of_month: date.d,
  })

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function updateRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  const description = String(formData.get('description') ?? '').trim()
  const amount = parseAmount(formData.get('amount'))
  const date = parseDateInput(formData.get('next_date'))

  if (!id || !description) return { error: 'Faltan datos' }
  if (amount === null || amount <= 0) return { error: 'El monto debe ser mayor a 0' }
  if (!date) return { error: 'La fecha no es válida' }

  const { error } = await supabase
    .from('recurring_items')
    .update({ description, amount, next_date: date.iso, day_of_month: date.d })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function deleteRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  // Los movimientos ya registrados se conservan (su recurring_id queda en null)
  const { error } = await supabase.from('recurring_items').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

// Botón "Registrar cobro / pago": crea el movimiento real con la fecha de hoy
// y mueve la "siguiente fecha" un mes adelante. La fecha es solo una referencia:
// se puede registrar antes o después de ella.
export async function registerRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  const { data: item } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!item) return { error: 'Registro no encontrado' }

  const current = parseDateInput(item.next_date)
  if (!current) return { error: 'La fecha guardada no es válida, edítala e inténtalo de nuevo' }

  const today = todayISO()
  const newNextDate = nextOccurrence(current, item.day_of_month, today)

  // Candado: si dos clics llegan a la vez, solo uno logra mover la fecha
  const { data: claimed } = await supabase
    .from('recurring_items')
    .update({ next_date: newNextDate })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('next_date', current.iso)
    .select('id')
  if (!claimed || claimed.length === 0) return { error: 'Este movimiento ya se registró' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    description: item.description,
    amount: item.amount,
    type: item.type,
    category: 'Mensual',
    date: today,
    recurring_id: item.id,
  })

  if (error) {
    // Si falló el registro, devolvemos la fecha como estaba
    await supabase.from('recurring_items').update({ next_date: current.iso }).eq('id', id).eq('user_id', user.id)
    return { error: error.message }
  }

  revalidatePath('/finanzas')
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* Metas                                                               */
/* ------------------------------------------------------------------ */

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const title = formData.get('title') as string
  const target_amount = parseFloat(formData.get('target_amount') as string)

  const { error } = await supabase.from('financial_goals').insert({
    user_id: user.id,
    title: title,
    target_amount: target_amount,
    current_amount: 0,
    status: 'active'
  })

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  const title = String(formData.get('title') ?? '').trim()
  const target_amount = parseAmount(formData.get('target_amount'))
  const current_amount = parseAmount(formData.get('current_amount'))

  if (!id || !title) return { error: 'Faltan datos' }
  if (target_amount === null || target_amount <= 0) return { error: 'El costo total debe ser mayor a 0' }
  if (current_amount === null || current_amount < 0) return { error: 'El monto ahorrado no puede ser negativo' }

  const { error } = await supabase
    .from('financial_goals')
    .update({ title, target_amount, current_amount })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  // Las metas solo "apartan" dinero visualmente, así que borrar una no cambia tu balance
  const { error } = await supabase.from('financial_goals').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

// Abonar dinero a una meta
export async function addFundsToGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const goalId = formData.get('goal_id') as string
  const amountToAdd = parseFloat(formData.get('amount') as string)

  // Obtenemos la meta actual para sumarle el nuevo dinero
  const { data: goal } = await supabase.from('financial_goals').select('current_amount').eq('id', goalId).single()
  if (!goal) return { error: 'Meta no encontrada' }

  const newAmount = goal.current_amount + amountToAdd

  const { error } = await supabase.from('financial_goals').update({ current_amount: newAmount }).eq('id', goalId)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

// Comprar la meta (la vuelve gasto y la borra de metas)
export async function completeGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const goalId = formData.get('goal_id') as string

  // Obtenemos la meta
  const { data: goal } = await supabase.from('financial_goals').select('*').eq('id', goalId).single()
  if (!goal) return { error: 'Meta no encontrada' }

  // 1. Registramos el gasto en transacciones por el total de la meta
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: user.id,
    description: `Meta comprada: ${goal.title}`,
    amount: goal.target_amount,
    type: 'gasto',
    category: 'Metas',
    date: todayISO()
  })
  if (txError) return { error: txError.message }

  // 2. Eliminamos la meta porque ya se cumplió
  const { error: delError } = await supabase.from('financial_goals').delete().eq('id', goalId)
  if (delError) return { error: delError.message }

  revalidatePath('/finanzas')
  return { success: true }
}