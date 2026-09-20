'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import {
  getFinanceData,
  updateBaseBalance,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addRecurring,
  updateRecurring,
  deleteRecurring,
  registerRecurring,
  addGoal,
  updateGoal,
  deleteGoal,
  addFundsToGoal,
  completeGoal,
} from './actions'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

/* ------------------------------------------------------------------ */
/* Utilidades                                                         */
/* ------------------------------------------------------------------ */

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const formatShortDate = (iso: string) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${m}/${d}/${String(y).slice(2)}`
}

const iconPaths = {
  back: <path d="m15 18-6-6 6-6" />,
  wallet: (
    <>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </>
  ),
  up: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  down: (
    <>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  edit: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  arrowIn: (
    <>
      <path d="M17 7 7 17" />
      <path d="M17 17H7V7" />
    </>
  ),
  arrowOut: (
    <>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: keyof typeof iconPaths; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FA66C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAF1EC]'

type DeleteTarget = { kind: 'transaction' | 'goal' | 'recurring'; item: any }

function getDeleteCopy({ kind, item }: DeleteTarget) {
  if (kind === 'transaction') {
    return {
      title: item.type === 'ingreso' ? 'Eliminar ingreso' : 'Eliminar gasto',
      text: `Se eliminará "${item.description}" por ${money(item.amount)}. Tu balance se recalculará.`,
    }
  }
  if (kind === 'goal') {
    return {
      title: 'Eliminar meta',
      text: `Se eliminará "${item.title}". El dinero apartado deja de contarse en metas y tu balance no cambia.`,
    }
  }
  return {
    title: item.type === 'ingreso' ? 'Eliminar ingreso mensual' : 'Eliminar gasto mensual',
    text: `"${item.description}" dejará de aparecer en tus mensuales. Los movimientos que ya registraste se conservan.`,
  }
}

/* ------------------------------------------------------------------ */
/* Componentes de apoyo                                              */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  description,
  action,
  onClose,
  children,
}: {
  title: string
  description?: string
  action: (formData: FormData) => void | Promise<void>
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#16211B]/30 p-4 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none sm:items-center"
    >
      <form
        action={action}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] border border-[#DCE8DF] bg-white p-7 shadow-2xl shadow-[#16211B]/10"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            {description && <p className="mt-1 text-sm leading-relaxed text-[#5B6B60]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#5B6B60] transition-colors hover:bg-[#F5F9F6] hover:text-[#16211B] ${focusRing}`}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  prefix,
  defaultValue,
  autoFocus,
  step,
  min,
  max,
  hint,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  prefix?: string
  defaultValue?: number | string
  autoFocus?: boolean
  step?: string
  min?: string
  max?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#33443A]">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-[#A0B0A5]">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          required
          step={step ?? (type === 'number' ? '0.01' : undefined)}
          min={min}
          max={max}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] py-3 pr-4 text-[15px] tabular-nums outline-none transition-colors placeholder:text-[#A0B0A5] focus:border-[#3FA66C] focus:bg-white focus:ring-4 focus:ring-[#3FA66C]/10 ${
            prefix ? 'pl-8' : 'pl-4'
          }`}
        />
      </div>
      {hint && <span className="mt-1.5 block text-xs text-[#5B6B60]">{hint}</span>}
    </label>
  )
}

function ModalActions({
  onCancel,
  submitLabel,
  submitClass,
  className = 'mt-7',
}: {
  onCancel: () => void
  submitLabel: string
  submitClass: string
  className?: string
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className={`flex-1 rounded-xl border border-[#DCE8DF] bg-white py-3 text-sm font-semibold text-[#33443A] transition-colors hover:bg-[#F5F9F6] ${focusRing}`}
      >
        Cancelar
      </button>
      <button
        type="submit"
        className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors ${submitClass} ${focusRing}`}
      >
        {submitLabel}
      </button>
    </div>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string
  icon: keyof typeof iconPaths
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-[#5B6B60] transition-colors ${
        danger ? 'hover:bg-red-50 hover:text-red-500' : 'hover:bg-[#E3F3EA] hover:text-[#2b754b]'
      } ${focusRing}`}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

function TransactionRow({
  t,
  onEdit,
  onDelete,
}: {
  t: any
  onEdit?: () => void
  onDelete?: () => void
}) {
  const isIncome = t.type === 'ingreso'
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-4 transition-colors hover:bg-[#F5F9F6] sm:gap-4 sm:px-4">
      <div className="flex items-center gap-3 overflow-hidden">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome ? 'bg-[#E3F3EA] text-[#3FA66C]' : 'bg-red-50 text-red-500'
          }`}
        >
          <Icon name={isIncome ? 'arrowIn' : 'arrowOut'} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#16211B]">{t.description}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5B6B60]">
            <span>{t.date}</span>
            {t.category === 'Mensual' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DCE8DF]/50 px-2 py-0.5 text-[11px] font-medium text-[#5B6B60]">
                <Icon name="repeat" size={11} />
                Mensual
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-12 sm:pl-0">
        <span
          className={`text-[15px] font-semibold tabular-nums ${isIncome ? 'text-[#3FA66C]' : 'text-red-500'}`}
        >
          {isIncome ? '+' : '-'}
          {money(t.amount)}
        </span>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1 ml-4">
            {onEdit && <IconButton label="Editar" icon="edit" onClick={onEdit} />}
            {onDelete && <IconButton label="Eliminar" icon="trash" danger onClick={onDelete} />}
          </div>
        )}
      </div>
    </li>
  )
}

function RecurringRow({
  r,
  isRegistering,
  onRegister,
  onEdit,
  onDelete,
}: {
  r: any
  isRegistering: boolean
  onRegister: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isIncome = r.type === 'ingreso'

  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-4 transition-colors hover:bg-[#F5F9F6] sm:gap-4 sm:px-4">
      <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome ? 'bg-[#E3F3EA] text-[#3FA66C]' : 'bg-red-50 text-red-500'
          }`}
        >
          <Icon name="repeat" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#16211B]">{r.description}</p>
          <p className="mt-0.5 text-xs text-[#5B6B60]">
            Siguiente {isIncome ? 'cobro' : 'pago'}: <span className="tabular-nums font-medium">{formatShortDate(r.next_date)}</span>
          </p>
        </div>
        <span
          className={`text-[15px] font-semibold tabular-nums sm:hidden ${isIncome ? 'text-[#3FA66C]' : 'text-red-500'}`}
        >
          {money(r.amount)}
        </span>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-12 sm:pl-0 gap-3">
        <span
          className={`hidden sm:inline-block text-[15px] font-semibold tabular-nums ${isIncome ? 'text-[#3FA66C]' : 'text-red-500'}`}
        >
          {money(r.amount)}
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRegister}
            disabled={isRegistering}
            className={`flex-1 sm:flex-none rounded-xl bg-[#1F3D2C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16301F] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            {isRegistering ? 'Registrando' : isIncome ? 'Cobrar' : 'Pagar'}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <IconButton label="Editar" icon="edit" onClick={onEdit} />
            <IconButton label="Eliminar" icon="trash" danger onClick={onDelete} />
          </div>
        </div>
      </div>
    </li>
  )
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: keyof typeof iconPaths
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F9F6] text-[#A0B0A5] ring-1 ring-[#DCE8DF]">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="text-base font-semibold text-[#16211B]">{title}</h3>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-[#5B6B60]">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                             */
/* ------------------------------------------------------------------ */

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'ingresos' | 'gastos' | 'metas'>('resumen')
  const [subTab, setSubTab] = useState<'movimientos' | 'mensuales'>('movimientos')
  const [isLoading, setIsLoading] = useState(true)

  const [baseBalance, setBaseBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [recurring, setRecurring] = useState<any[]>([])
  const [today, setToday] = useState('')
  const [registeringId, setRegisteringId] = useState<string | null>(null)

  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isAbonarModalOpen, setIsAbonarModalOpen] = useState(false)

  const [transactionType, setTransactionType] = useState<'ingreso' | 'gasto'>('ingreso')
  const [recurringType, setRecurringType] = useState<'ingreso' | 'gasto'>('gasto')

  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [editingRecurring, setEditingRecurring] = useState<any>(null)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  const loadData = async () => {
    const data = await getFinanceData()
    setBaseBalance(data.baseBalance)
    setTransactions(data.transactions)
    setGoals(data.goals)
    setRecurring(data.recurring)
    setToday(data.today)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateBalance = async (formData: FormData) => {
    setIsEditBalanceOpen(false)
    const res = await updateBaseBalance(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleSaveTransaction = async (formData: FormData) => {
    const isEditing = !!editingTransaction
    closeTransactionModal()
    const res = isEditing ? await updateTransaction(formData) : await addTransaction(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleSaveRecurring = async (formData: FormData) => {
    const isEditing = !!editingRecurring
    closeRecurringModal()
    const res = isEditing ? await updateRecurring(formData) : await addRecurring(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleSaveGoal = async (formData: FormData) => {
    const isEditing = !!editingGoal
    closeGoalModal()
    const res = isEditing ? await updateGoal(formData) : await addGoal(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleAbonar = async (formData: FormData) => {
    setIsAbonarModalOpen(false)
    const res = await addFundsToGoal(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleComprar = async (formData: FormData) => {
    const res = await completeGoal(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const handleRegister = async (id: string) => {
    setRegisteringId(id)
    const formData = new FormData()
    formData.set('id', id)
    const res = await registerRecurring(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
    setRegisteringId(null)
  }

  const handleDelete = async (formData: FormData) => {
    const target = deleteTarget
    setDeleteTarget(null)
    if (!target) return
    const res =
      target.kind === 'transaction'
        ? await deleteTransaction(formData)
        : target.kind === 'goal'
          ? await deleteGoal(formData)
          : await deleteRecurring(formData)
    if (res?.error) alert(`Error: ${res.error}`)
    await loadData()
  }

  const openTransactionModal = (type: 'ingreso' | 'gasto', item: any = null) => {
    setTransactionType(type)
    setEditingTransaction(item)
    setIsTransactionModalOpen(true)
  }
  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false)
    setEditingTransaction(null)
  }

  const openRecurringModal = (type: 'ingreso' | 'gasto', item: any = null) => {
    setRecurringType(type)
    setEditingRecurring(item)
    setIsRecurringModalOpen(true)
  }
  const closeRecurringModal = () => {
    setIsRecurringModalOpen(false)
    setEditingRecurring(null)
  }

  const openGoalModal = (item: any = null) => {
    setEditingGoal(item)
    setIsGoalModalOpen(true)
  }
  const closeGoalModal = () => {
    setIsGoalModalOpen(false)
    setEditingGoal(null)
  }

  const closeAbonarModal = () => {
    setIsAbonarModalOpen(false)
    setSelectedGoal(null)
  }

  const totalIngresos = transactions.filter((t) => t.type === 'ingreso').reduce((acc, curr) => acc + curr.amount, 0)
  const totalGastos = transactions.filter((t) => t.type === 'gasto').reduce((acc, curr) => acc + curr.amount, 0)
  const totalAhorradoEnMetas = goals.reduce((acc, curr) => acc + curr.current_amount, 0)
  const totalObjetivoMetas = goals.reduce((acc, curr) => acc + curr.target_amount, 0)
  const progresoGlobalMetas = totalObjetivoMetas > 0 ? Math.min((totalAhorradoEnMetas / totalObjetivoMetas) * 100, 100) : 0

  const balanceDisponible = baseBalance + totalIngresos - totalGastos

  const activeType: 'ingreso' | 'gasto' = activeTab === 'ingresos' ? 'ingreso' : 'gasto'
  const activeTransactions = transactions.filter((t) => t.type === activeType)
  const activeTotal = activeType === 'ingreso' ? totalIngresos : totalGastos
  const activeRecurring = recurring.filter((r) => r.type === activeType)
  const recurringTotal = activeRecurring.reduce((acc, curr) => acc + curr.amount, 0)

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: 'list' },
    { id: 'ingresos', label: 'Ingresos', icon: 'up' },
    { id: 'gastos', label: 'Gastos', icon: 'down' },
    { id: 'metas', label: 'Metas', icon: 'target' }, // Reduje a "Metas" para mejor ajuste móvil
  ] as const

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-[#EAF1EC] ${manrope.className}`}>
        <div className="flex items-center gap-3 text-[#5B6B60]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8DF] border-t-[#3FA66C] motion-reduce:animate-none" />
          <span className="text-sm font-medium">Cargando tus finanzas</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#EAF1EC] text-[#16211B] antialiased ${manrope.className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10 md:py-12">
        {/* ENCABEZADO */}
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white text-[#5B6B60] shadow-sm transition-colors hover:text-[#16211B] ${focusRing}`}
          >
            <Icon name="back" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">Finanzas</h1>
            <p className="text-sm text-[#5B6B60]">Control dinámico de tu dinero</p>
          </div>
        </header>

        {/* NAVEGACIÓN RESPONSIVE (ARREGLADA PARA MÓVIL) */}
        <div className="mb-8">
          <div
            role="tablist"
            aria-label="Secciones de finanzas"
            className="grid grid-cols-2 md:flex md:w-max gap-1.5 rounded-2xl border border-[#DCE8DF] bg-white p-1.5 shadow-sm"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center md:justify-start gap-2 whitespace-nowrap rounded-xl px-2 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                    isActive
                      ? 'bg-[#1F3D2C] text-white shadow-sm'
                      : 'text-[#5B6B60] hover:bg-[#F5F9F6] hover:text-[#16211B]'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* VISTA RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Balance principal */}
              <section className="relative overflow-hidden rounded-[28px] bg-[#1F3D2C] p-6 text-white shadow-lg shadow-[#1F3D2C]/15 md:p-9 lg:col-span-2">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full border border-white/5" />
                <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full border border-white/5" />

                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <Icon name="wallet" size={22} />
                      </span>
                      <span className="text-sm font-medium text-white/70">Balance disponible</span>
                    </div>
                    <button
                      onClick={() => setIsEditBalanceOpen(true)}
                      className="flex self-start items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <Icon name="edit" size={14} />
                      Editar banco
                    </button>
                  </div>

                  <h2
                    className={`mt-6 text-4xl font-semibold tabular-nums tracking-tight md:text-5xl ${
                      balanceDisponible < 0 ? 'text-red-300' : 'text-white'
                    }`}
                  >
                    {money(balanceDisponible)}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">Banco base más ingresos, menos gastos</p>

                  <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-3 sm:gap-y-0 border-t border-white/10 pt-6">
                    <div className="pr-3">
                      <dt className="text-xs font-medium text-white/60">Banco base</dt>
                      <dd className="mt-1.5 text-[15px] font-semibold tabular-nums md:text-lg">{money(baseBalance)}</dd>
                    </div>
                    <div className="border-l border-white/10 pl-4 md:px-5">
                      <dt className="text-xs font-medium text-white/60">Ingresos</dt>
                      <dd className="mt-1.5 text-[15px] font-semibold tabular-nums text-[#7FD3A3] md:text-lg">
                        +{money(totalIngresos)}
                      </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-5">
                      <dt className="text-xs font-medium text-white/60">Gastos</dt>
                      <dd className="mt-1.5 text-[15px] font-semibold tabular-nums text-red-300 md:text-lg">
                        -{money(totalGastos)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* Ahorro en metas */}
              <section className="flex flex-col justify-between rounded-[28px] border border-[#DCE8DF] bg-white p-6 shadow-sm md:p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon name="target" size={22} />
                    </span>
                    <span className="text-sm font-medium text-[#5B6B60]">Ahorro en metas</span>
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold tabular-nums tracking-tight">
                    {money(totalAhorradoEnMetas)}
                  </h2>
                  <p className="mt-1 text-sm text-[#5B6B60]">
                    {goals.length === 0
                      ? 'Sin metas activas'
                      : `de ${money(totalObjetivoMetas)} en ${goals.length} ${goals.length === 1 ? 'meta' : 'metas'}`}
                  </p>
                  <div
                    className="mt-5 h-2 w-full overflow-hidden rounded-full border border-[#DCE8DF] bg-[#F5F9F6]"
                    role="progressbar"
                    aria-valuenow={Math.round(progresoGlobalMetas)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-[#3FA66C] transition-all duration-500"
                      style={{ width: `${progresoGlobalMetas}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('metas')}
                  className={`mt-7 w-full rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] py-2.5 text-sm font-semibold text-[#1F3D2C] transition-colors hover:bg-[#DCE8DF] ${focusRing}`}
                >
                  Administrar metas
                </button>
              </section>
            </div>

            {/* Movimientos */}
            <section className="rounded-[28px] border border-[#DCE8DF] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between px-2 sm:px-4 gap-2">
                <h3 className="text-lg font-semibold tracking-tight">Todos los movimientos</h3>
                {transactions.length > 0 && (
                  <span className="text-sm text-[#5B6B60]">
                    {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'}
                  </span>
                )}
              </div>
              {transactions.length === 0 ? (
                <EmptyState
                  icon="list"
                  title="Aún no hay movimientos"
                  text="Registra tu primer ingreso o gasto y aparecerá aquí."
                />
              ) : (
                <ul className="divide-y divide-[#E6EFE9] mt-2">
                  {transactions.map((t) => (
                    <TransactionRow key={t.id} t={t} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* VISTAS INGRESOS / GASTOS */}
        {(activeTab === 'ingresos' || activeTab === 'gastos') && (
          <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {activeType === 'ingreso' ? 'Mis ingresos' : 'Mis gastos'}
                </h2>
                <p className="mt-1 text-sm text-[#5B6B60]">
                  {subTab === 'movimientos' ? (
                    <>
                      <span className="font-semibold tabular-nums text-[#16211B]">{money(activeTotal)}</span> en total,{' '}
                      {activeTransactions.length} {activeTransactions.length === 1 ? 'registro' : 'registros'}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold tabular-nums text-[#16211B]">{money(recurringTotal)}</span> al mes,{' '}
                      {activeRecurring.length} {activeRecurring.length === 1 ? 'registro' : 'registros'}
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() =>
                  subTab === 'movimientos' ? openTransactionModal(activeType) : openRecurringModal(activeType)
                }
                className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors ${focusRing} ${
                  activeType === 'ingreso' ? 'bg-[#3FA66C] hover:bg-[#2b754b]' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                <Icon name="plus" size={18} />
                {subTab === 'movimientos'
                  ? `Nuevo ${activeType === 'ingreso' ? 'ingreso' : 'gasto'}`
                  : `Colocar ${activeType === 'ingreso' ? 'ingreso' : 'gasto'} mensual`}
              </button>
            </div>

            {/* Subsecciones Responsive */}
            <div className="mb-5">
              <div
                role="tablist"
                aria-label="Tipo de registro"
                className="flex w-full sm:w-max gap-1 rounded-xl bg-[#DCE8DF]/60 p-1"
              >
                {(
                  [
                    { id: 'movimientos', label: 'Movimientos', count: 0 },
                    { id: 'mensuales', label: 'Mensuales', count: activeRecurring.length },
                  ] as const
                ).map((s) => {
                  const isActive = subTab === s.id
                  return (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSubTab(s.id)}
                      className={`flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-lg px-2 sm:px-4 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                        isActive ? 'bg-white text-[#16211B] shadow-sm' : 'text-[#5B6B60] hover:text-[#16211B]'
                      }`}
                    >
                      {s.label}
                      {s.count > 0 && (
                        <span
                          aria-label={`${s.count} registros`}
                          className="rounded-full bg-[#E3F3EA] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#2b754b]"
                        >
                          {s.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {subTab === 'movimientos' ? (
              <div className="rounded-[28px] border border-[#DCE8DF] bg-white p-2 shadow-sm sm:p-6">
                {activeTransactions.length === 0 ? (
                  <EmptyState
                    icon={activeType === 'ingreso' ? 'up' : 'down'}
                    title={`Sin ${activeType === 'ingreso' ? 'ingresos' : 'gastos'} registrados`}
                    text={`Agrega tu primer ${activeType === 'ingreso' ? 'ingreso' : 'gasto'} para empezar a llevar el control.`}
                  />
                ) : (
                  <ul className="divide-y divide-[#E6EFE9]">
                    {activeTransactions.map((t) => (
                      <TransactionRow
                        key={t.id}
                        t={t}
                        onEdit={() => openTransactionModal(t.type, t)}
                        onDelete={() => setDeleteTarget({ kind: 'transaction', item: t })}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="rounded-[28px] border border-[#DCE8DF] bg-white p-2 shadow-sm sm:p-6">
                <div className="mb-4 mx-2 sm:mx-0 flex items-start gap-3 rounded-2xl bg-[#F5F9F6] px-4 py-3 text-sm text-[#5B6B60] ring-1 ring-[#DCE8DF]">
                  <span className="mt-0.5 shrink-0 text-[#3FA66C]">
                    <Icon name="calendar" size={16} />
                  </span>
                  <p className="leading-relaxed">
                    {activeType === 'ingreso'
                      ? 'Cuando te paguen, presiona Registrar cobro y se agregará a tus ingresos con la fecha de hoy. La fecha de siguiente cobro avanza un mes.'
                      : 'Cuando pagues, presiona Registrar pago y se agregará a tus gastos con la fecha de hoy. La fecha de siguiente pago avanza un mes.'}
                  </p>
                </div>
                {activeRecurring.length === 0 ? (
                  <EmptyState
                    icon="repeat"
                    title={`Sin ${activeType === 'ingreso' ? 'ingresos' : 'gastos'} mensuales`}
                    text={
                      activeType === 'ingreso'
                        ? 'Agrega tu salario u otros ingresos fijos y registra cada cobro con un botón.'
                        : 'Agrega el alquiler, suscripciones y otros pagos fijos y registra cada pago con un botón.'
                    }
                    action={
                      <button
                        onClick={() => openRecurringModal(activeType)}
                        className={`flex items-center gap-2 rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] px-4 py-2.5 text-sm font-semibold text-[#1F3D2C] transition-colors hover:bg-[#DCE8DF] ${focusRing}`}
                      >
                        <Icon name="plus" size={16} />
                        Colocar {activeType === 'ingreso' ? 'ingreso' : 'gasto'} mensual
                      </button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-[#E6EFE9]">
                    {activeRecurring.map((r) => (
                      <RecurringRow
                        key={r.id}
                        r={r}
                        isRegistering={registeringId === r.id}
                        onRegister={() => handleRegister(r.id)}
                        onEdit={() => openRecurringModal(r.type, r)}
                        onDelete={() => setDeleteTarget({ kind: 'recurring', item: r })}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA METAS DE AHORRO */}
        {activeTab === 'metas' && (
          <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Mis metas de ahorro</h2>
                <p className="mt-1 text-sm text-[#5B6B60]">Aparta dinero para lo que quieres comprar sin gastarlo antes de tiempo.</p>
              </div>
              <button
                onClick={() => openGoalModal()}
                className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 ${focusRing}`}
              >
                <Icon name="plus" size={18} />
                Nueva meta
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="rounded-[28px] border border-[#DCE8DF] bg-white shadow-sm">
                <EmptyState
                  icon="target"
                  title="No tienes metas activas"
                  text="Crea una meta para separar dinero sin gastarlo."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {goals.map((goal) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                  const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
                  const reached = progress >= 100
                  return (
                    <article
                      key={goal.id}
                      className="flex flex-col justify-between rounded-[28px] border border-[#DCE8DF] bg-white p-6 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 text-lg font-semibold leading-snug tracking-tight">{goal.title}</h3>
                          <div className="-mr-2 -mt-1 flex shrink-0 items-center gap-0.5">
                            <IconButton label="Editar meta" icon="edit" onClick={() => openGoalModal(goal)} />
                            <IconButton
                              label="Eliminar meta"
                              icon="trash"
                              danger
                              onClick={() => setDeleteTarget({ kind: 'goal', item: goal })}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                          <div>
                            <p className="text-3xl font-semibold tabular-nums tracking-tight">
                              {money(goal.current_amount)}
                            </p>
                            <p className="mt-1 text-sm text-[#5B6B60]">de {money(goal.target_amount)}</p>
                          </div>
                          {reached ? (
                            <span className="flex self-start sm:self-auto shrink-0 items-center gap-1.5 rounded-full bg-[#E3F3EA] px-3 py-1 text-xs font-semibold text-[#2b754b]">
                              <Icon name="check" size={13} />
                              Meta alcanzada
                            </span>
                          ) : (
                            <span className="self-start sm:self-auto shrink-0 rounded-full bg-[#F5F9F6] px-3 py-1 text-xs font-semibold tabular-nums text-[#5B6B60] ring-1 ring-[#DCE8DF]">
                              {progress.toFixed(0)}%
                            </span>
                          )}
                        </div>

                        <div
                          className="mt-5 h-2.5 w-full overflow-hidden rounded-full border border-[#DCE8DF] bg-[#F5F9F6]"
                          role="progressbar"
                          aria-valuenow={Math.round(progress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progreso de ${goal.title}`}
                        >
                          <div
                            className="h-full rounded-full bg-[#3FA66C] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-[#5B6B60]">
                          {reached ? 'Ya tienes el monto completo' : `Faltan ${money(remaining)}`}
                        </p>
                      </div>

                      <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setSelectedGoal(goal)
                            setIsAbonarModalOpen(true)
                          }}
                          className={`flex-1 rounded-xl border border-[#DCE8DF] bg-[#F5F9F6] py-3 sm:py-2.5 text-sm font-semibold text-[#1F3D2C] transition-colors hover:bg-[#DCE8DF] ${focusRing}`}
                        >
                          Abonar
                        </button>

                        <form action={handleComprar} className="flex-1">
                          <input type="hidden" name="goal_id" value={goal.id} />
                          <button
                            type="submit"
                            className={`w-full rounded-xl bg-[#1F3D2C] py-3 sm:py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16301F] ${focusRing}`}
                          >
                            Comprar
                          </button>
                        </form>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES */}
      {isEditBalanceOpen && (
        <Modal
          title="Dinero en banco"
          description="Actualiza el balance base de tu cuenta."
          action={handleUpdateBalance}
          onClose={() => setIsEditBalanceOpen(false)}
        >
          <Field label="Balance base" name="amount" type="number" prefix="$" defaultValue={baseBalance} autoFocus />
          <ModalActions
            onCancel={() => setIsEditBalanceOpen(false)}
            submitLabel="Guardar"
            submitClass="bg-[#1F3D2C] hover:bg-[#16301F]"
          />
        </Modal>
      )}

      {isTransactionModalOpen && (
        <Modal
          title={`${editingTransaction ? 'Editar' : 'Nuevo'} ${transactionType === 'ingreso' ? 'ingreso' : 'gasto'}`}
          description={
            transactionType === 'ingreso'
              ? 'Registra dinero que entra a tu cuenta.'
              : 'Registra dinero que sale de tu cuenta.'
          }
          action={handleSaveTransaction}
          onClose={closeTransactionModal}
        >
          <input type="hidden" name="type" value={transactionType} />
          {editingTransaction && <input type="hidden" name="id" value={editingTransaction.id} />}
          <div className="flex flex-col gap-4">
            <Field
              label="Descripción"
              name="description"
              placeholder={transactionType === 'ingreso' ? 'Ej: Salario' : 'Ej: Supermercado'}
              defaultValue={editingTransaction?.description}
              autoFocus
            />
            <Field
              label="Monto"
              name="amount"
              type="number"
              prefix="$"
              placeholder="0.00"
              min="0.01"
              defaultValue={editingTransaction?.amount}
            />
          </div>
          <ModalActions
            onCancel={closeTransactionModal}
            submitLabel={editingTransaction ? 'Guardar cambios' : 'Guardar'}
            submitClass={transactionType === 'ingreso' ? 'bg-[#3FA66C] hover:bg-[#2b754b]' : 'bg-red-500 hover:bg-red-600'}
          />
        </Modal>
      )}

      {isRecurringModalOpen && (
        <Modal
          title={`${editingRecurring ? 'Editar' : 'Colocar'} ${recurringType === 'ingreso' ? 'ingreso' : 'gasto'} mensual`}
          description={
            recurringType === 'ingreso'
              ? 'Guarda un ingreso fijo. Cuando te paguen, presionas Registrar cobro.'
              : 'Guarda un gasto fijo. Cuando pagues, presionas Registrar pago.'
          }
          action={handleSaveRecurring}
          onClose={closeRecurringModal}
        >
          <input type="hidden" name="type" value={recurringType} />
          {editingRecurring && <input type="hidden" name="id" value={editingRecurring.id} />}
          <div className="flex flex-col gap-4">
            <Field
              label="Descripción"
              name="description"
              placeholder={recurringType === 'ingreso' ? 'Ej: Salario' : 'Ej: Alquiler'}
              defaultValue={editingRecurring?.description}
              autoFocus
            />
            <Field
              label="Monto"
              name="amount"
              type="number"
              prefix="$"
              placeholder="0.00"
              min="0.01"
              defaultValue={editingRecurring?.amount}
            />
            <Field
              label={recurringType === 'ingreso' ? 'Fecha del próximo cobro' : 'Fecha del próximo pago'}
              name="next_date"
              type="date"
              defaultValue={editingRecurring?.next_date ?? today}
              hint="Es solo una referencia. Puedes registrarlo antes o después."
            />
          </div>
          <ModalActions
            onCancel={closeRecurringModal}
            submitLabel={editingRecurring ? 'Guardar cambios' : 'Guardar'}
            submitClass={recurringType === 'ingreso' ? 'bg-[#3FA66C] hover:bg-[#2b754b]' : 'bg-red-500 hover:bg-red-600'}
          />
        </Modal>
      )}

      {isGoalModalOpen && (
        <Modal
          title={editingGoal ? 'Editar meta' : 'Nueva meta'}
          description={
            editingGoal
              ? 'Cambia el nombre, el costo o lo que llevas ahorrado.'
              : 'Define cuánto cuesta lo que quieres y ve apartando dinero.'
          }
          action={handleSaveGoal}
          onClose={closeGoalModal}
        >
          {editingGoal && <input type="hidden" name="id" value={editingGoal.id} />}
          <div className="flex flex-col gap-4">
            <Field
              label="Nombre de la meta"
              name="title"
              placeholder="Ej: Nueva laptop"
              defaultValue={editingGoal?.title}
              autoFocus
            />
            <Field
              label="Costo total"
              name="target_amount"
              type="number"
              prefix="$"
              placeholder="Ej: 1200.00"
              min="0.01"
              defaultValue={editingGoal?.target_amount}
            />
            {editingGoal && (
              <Field
                label="Ahorrado hasta ahora"
                name="current_amount"
                type="number"
                prefix="$"
                min="0"
                defaultValue={editingGoal.current_amount}
                hint="Ajusta este valor si te equivocaste al abonar."
              />
            )}
          </div>
          <ModalActions
            onCancel={closeGoalModal}
            submitLabel={editingGoal ? 'Guardar cambios' : 'Crear meta'}
            submitClass="bg-blue-600 hover:bg-blue-700"
          />
        </Modal>
      )}

      {isAbonarModalOpen && selectedGoal && (
        <Modal
          title={`Abonar a ${selectedGoal.title}`}
          description="Ingresa cuánto quieres apartar para esta meta."
          action={handleAbonar}
          onClose={closeAbonarModal}
        >
          <input type="hidden" name="goal_id" value={selectedGoal.id} />
          <Field label="Monto a abonar" name="amount" type="number" prefix="$" placeholder="Ej: 25.00" autoFocus />
          <ModalActions
            onCancel={closeAbonarModal}
            submitLabel="Abonar"
            submitClass="bg-[#3FA66C] hover:bg-[#2b754b]"
          />
        </Modal>
      )}

      {deleteTarget &&
        (() => {
          const copy = getDeleteCopy(deleteTarget)
          return (
            <Modal title={copy.title} description={copy.text} action={handleDelete} onClose={() => setDeleteTarget(null)}>
              <input type="hidden" name="id" value={deleteTarget.item.id} />
              <ModalActions
                className="mt-0"
                onCancel={() => setDeleteTarget(null)}
                submitLabel="Eliminar"
                submitClass="bg-red-500 hover:bg-red-600"
              />
            </Modal>
          )
        })()}
    </div>
  )
}