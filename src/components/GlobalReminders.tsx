'use client'

import { useState, useEffect } from 'react'
import Toast from './Toast'
import { getCalendarReminders } from '@/app/calendario/actions'

export default function GlobalReminders() {
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    const checkReminders = async () => {
      const reminders = await getCalendarReminders()
      const now = new Date()

      reminders.forEach((rem: any) => {
        // Unir fecha y hora del recordatorio
        const remDate = new Date(`${rem.date_id}T${rem.time}:00`)
        const diffMs = remDate.getTime() - now.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins > 0) {
          // 1 Día antes (entre 24h y 23h)
          if (diffMins <= 1440 && diffMins > 1380 && !localStorage.getItem(`rem_${rem.id}_1d`)) {
            setToastMsg(`Mañana: ${rem.title} a las ${rem.time}`)
            localStorage.setItem(`rem_${rem.id}_1d`, 'true')
          }
          // 1 Hora antes
          else if (diffMins <= 60 && diffMins > 50 && !localStorage.getItem(`rem_${rem.id}_1h`)) {
            setToastMsg(`En 1 hora: ${rem.title}`)
            localStorage.setItem(`rem_${rem.id}_1h`, 'true')
          }
          // 20 Minutos antes
          else if (diffMins <= 20 && diffMins > 0 && !localStorage.getItem(`rem_${rem.id}_20m`)) {
            setToastMsg(`¡Faltan 20 mins! ${rem.title}`)
            localStorage.setItem(`rem_${rem.id}_20m`, 'true')
          }
        }
      })
    }

    // Revisar inmediatamente y luego cada 1 minuto
    checkReminders()
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  return <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
}