'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNutritionData(date_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { dailyInfo: null, userGoals: null, logs: [], savedFoods: [] }

  const { data: savedFoods } = await supabase.from('saved_foods').select('*').eq('user_id', user.id).order('name')
  const { data: dailyInfo } = await supabase.from('daily_nutrition').select('burned_calories').eq('user_id', user.id).eq('date_id', date_id).single()
  const { data: logs } = await supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date_id', date_id).order('created_at', { ascending: true })
  
  // Extraemos las metas de las preferencias globales del usuario
  const { data: pref } = await supabase.from('user_preferences').select('target_calories, target_protein, target_carbs, target_fat').eq('user_id', user.id).single()

  return {
    savedFoods: savedFoods || [],
    dailyInfo: { burned_calories: dailyInfo?.burned_calories || 0 },
    userGoals: { 
      target_calories: pref?.target_calories || 2000, 
      target_protein: pref?.target_protein || 150, 
      target_carbs: pref?.target_carbs || 250, 
      target_fat: pref?.target_fat || 60 
    },
    logs: logs || []
  }
}

export async function addFoodLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const date_id = formData.get('date_id') as string
  const name = formData.get('name') as string
  const calories = parseFloat(formData.get('calories') as string) || 0
  const protein = parseFloat(formData.get('protein') as string) || 0
  const carbs = parseFloat(formData.get('carbs') as string) || 0
  const fat = parseFloat(formData.get('fat') as string) || 0
  const meal_type = formData.get('meal_type') as string || 'merienda'
  const saveAsFrequent = formData.get('save_frequent') === 'on'

  const { error } = await supabase.from('food_logs').insert({ user_id: user.id, date_id, name, calories, protein, carbs, fat, meal_type })
  if (error) return { error: error.message }
  if (saveAsFrequent) await supabase.from('saved_foods').insert({ user_id: user.id, name, calories, protein, carbs, fat })

  revalidatePath('/contadorcalorias')
  return { success: true }
}

export async function updateFoodLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const calories = parseFloat(formData.get('calories') as string) || 0
  const protein = parseFloat(formData.get('protein') as string) || 0
  const carbs = parseFloat(formData.get('carbs') as string) || 0
  const fat = parseFloat(formData.get('fat') as string) || 0
  const meal_type = formData.get('meal_type') as string

  const { error } = await supabase.from('food_logs').update({ name, calories, protein, carbs, fat, meal_type }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/contadorcalorias')
  return { success: true }
}

export async function deleteFoodLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('food_logs').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/contadorcalorias')
  return { success: true }
}

export async function deleteSavedFood(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('saved_foods').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/contadorcalorias')
  return { success: true }
}

// SOLO actualiza las calorías quemadas del día actual
export async function updateDailyBurned(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const date_id = formData.get('date_id') as string
  const burned = parseFloat(formData.get('burned') as string) || 0

  const { error } = await supabase.from('daily_nutrition').upsert({
    user_id: user.id,
    date_id: date_id,
    burned_calories: burned
  }, { onConflict: 'user_id, date_id' })

  if (error) return { error: error.message }
  revalidatePath('/contadorcalorias')
  return { success: true }
}

// NUEVO: Actualiza tus metas permanentemente para todos los días
export async function updateUserGoals(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No logueado' }

  const target_calories = parseFloat(formData.get('target_calories') as string) || 2000
  const target_protein = parseFloat(formData.get('target_protein') as string) || 150
  const target_carbs = parseFloat(formData.get('target_carbs') as string) || 250
  const target_fat = parseFloat(formData.get('target_fat') as string) || 60

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: user.id,
    target_calories,
    target_protein,
    target_carbs,
    target_fat
  }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/contadorcalorias')
  return { success: true }
}