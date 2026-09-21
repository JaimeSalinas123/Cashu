'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* ------------------------------------------------------------------ */
/* Utilidades de fecha                                                */
/* ------------------------------------------------------------------ */

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

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate() 

const parseAmount = (value: FormDataEntryValue | null) => {
  const n = parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : null
}

function parseDateInput(value: unknown) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''))
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null
  return { y, m, d, iso: `${y}-${pad(m)}-${pad(d)}` }
}

// Nueva lógica de avance considerando Mensual o Semanal
function nextOccurrence(currentIso: string, anchorDay: number, today: string, frequency: string) {
  if (frequency === 'semanal') {
    let [y, m, d] = currentIso.split('-').map(Number)
    let dateObj = new Date(y, m - 1, d)
    let iso
    do {
      dateObj.setDate(dateObj.getDate() + 7)
      iso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`
    } while (iso <= today)
    return iso
  } else {
    // Lógica mensual
    let [y, m] = currentIso.split('-').map(Number)
    let iso
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
}

/* ------------------------------------------------------------------ */
/* Lectura                                                            */
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
    today: todayISO(),
  }
}

/* ------------------------------------------------------------------ */
/* Balance base                                                       */
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
/* Ingresos y gastos                                                  */
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

  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* Ingresos y gastos recurrentes (se registran con un botón)          */
/* ------------------------------------------------------------------ */

export async function addRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás logueado' }

  const description = String(formData.get('description') ?? '').trim()
  const amount = parseAmount(formData.get('amount'))
  const type = formData.get('type') as string
  const date = parseDateInput(formData.get('next_date'))
  const frequency = formData.get('frequency') as string || 'mensual'

  if (!description) return { error: 'Falta la descripción' }
  if (amount === null || amount <= 0) return { error: 'El monto debe ser mayor a 0' }
  if (type !== 'ingreso' && type !== 'gasto') return { error: 'Tipo inválido' }
  if (!date) return { error: 'La fecha no es válida' }

  const { error } = await supabase.from('recurring_items').insert({
    user_id: user.id,
    description,
    amount,
    type,
    next_date: date.iso,
    day_of_month: date.d,
    frequency
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
  const frequency = formData.get('frequency') as string || 'mensual'

  if (!id || !description) return { error: 'Faltan datos' }
  if (amount === null || amount <= 0) return { error: 'El monto debe ser mayor a 0' }
  if (!date) return { error: 'La fecha no es válida' }

  const { error } = await supabase
    .from('recurring_items')
    .update({ description, amount, next_date: date.iso, day_of_month: date.d, frequency })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function deleteRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  const { error } = await supabase.from('recurring_items').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/finanzas')
  return { success: true }
}

export async function registerRecurring(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Faltan datos' }

  const { data: item } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!item) return { error: 'Registro no encontrado' }

  const today = todayISO()
  const newNextDate = nextOccurrence(item.next_date, item.day_of_month, today, item.frequency || 'mensual')

  const { data: claimed } = await supabase
    .from('recurring_items')
    .update({ next_date: newNextDate })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('next_date', item.next_date)
    .select('id')
  
  if (!claimed || claimed.length === 0) return { error: 'Este movimiento ya se registró' }

  // Asignamos la categoría según la frecuencia guardada
  const categoryLabel = item.frequency === 'semanal' ? 'Semanal' : 'Mensual'

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    description: item.description,
    amount: item.amount,
    type: item.type,
    category: categoryLabel,
    date: today,
    recurring_id: item.id,
  })

  if (error) {
    await supabase.from('recurring_items').update({ next_date: item.next_date }).eq('id', id).eq('user_id', user.id)
    return { error: error.message }
  }

  revalidatePath('/finanzas')
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* Metas                                                              */
/* ------------------------------------------------------------------ */

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const title = formData.get('title') as string
  const target_amount = parseFloat(formData.get('target_amount') as string)

  const { error } = await supabase.from('financial_goals').insert({
    user_id: user.id, title, target_amount, current_amount: 0, status: 'active'
  })
  if (error) return { error: error.message }
  revalidatePath('/finanzas')
  return { success: true }
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const title = String(formData.get('title') ?? '').trim()
  const target_amount = parseAmount(formData.get('target_amount'))
  const current_amount = parseAmount(formData.get('current_amount'))

  if (!id || !title) return { error: 'Faltan datos' }
  if (target_amount === null || target_amount <= 0) return { error: 'Monto inválido' }

  const { error } = await supabase.from('financial_goals').update({ title, target_amount, current_amount }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/finanzas')
  return { success: true }
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('financial_goals').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/finanzas')
  return { success: true }
}

export async function addFundsToGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const goalId = formData.get('goal_id') as string
  const amountToAdd = parseFloat(formData.get('amount') as string)

  const { data: goal } = await supabase.from('financial_goals').select('current_amount').eq('id', goalId).single()
  if (!goal) return { error: 'Meta no encontrada' }

  const newAmount = goal.current_amount + amountToAdd
  const { error } = await supabase.from('financial_goals').update({ current_amount: newAmount }).eq('id', goalId)
  if (error) return { error: error.message }
  revalidatePath('/finanzas')
  return { success: true }
}

export async function completeGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const goalId = formData.get('goal_id') as string
  const { data: goal } = await supabase.from('financial_goals').select('*').eq('id', goalId).single()
  if (!goal) return { error: 'Meta no encontrada' }

  const { error: txError } = await supabase.from('transactions').insert({
    user_id: user.id, description: `Meta comprada: ${goal.title}`, amount: goal.target_amount, type: 'gasto', category: 'Metas', date: todayISO()
  })
  if (txError) return { error: txError.message }

  const { error: delError } = await supabase.from('financial_goals').delete().eq('id', goalId)
  if (delError) return { error: delError.message }
  revalidatePath('/finanzas')
  return { success: true }
}