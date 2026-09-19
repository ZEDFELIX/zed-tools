import { useState } from 'react'
import type { ReactNode } from 'react'
import { Star } from 'lucide-react'
import { cx } from '../lib/utils'

export function Field({
  label,
  hint,
  required,
  error,
  children,
  className,
}: {
  label?: ReactNode
  hint?: ReactNode
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50'

export const buttonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'

export function FavoriteButton({
  toolId,
  className,
}: {
  toolId: string
  className?: string
}) {
  const [favorite, setFavorite] = useState(() => {
    try {
      const stored = localStorage.getItem('zed:favorites')
      return stored ? (JSON.parse(stored) as string[]).includes(toolId) : false
    } catch {
      return false
    }
  })

  const toggle = () => {
    const stored = localStorage.getItem('zed:favorites')
    let list: string[] = []
    try {
      list = stored ? JSON.parse(stored) : []
    } catch {
      list = []
    }
    const next = list.includes(toolId) ? list.filter((id) => id !== toolId) : [...list, toolId]
    localStorage.setItem('zed:favorites', JSON.stringify(next))
    setFavorite(!favorite)
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={favorite}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition',
        favorite
          ? 'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-500/30 dark:bg-amber-500/10'
          : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-amber-400',
        className,
      )}
    >
      <Star className={cx('h-4 w-4', favorite && 'fill-current')} aria-hidden />
    </button>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function badgeClass(status: string): string {
  switch (status) {
    case 'beta':
      return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30'
    case 'experimental':
      return 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/30'
    case 'disabled':
      return 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
    default:
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30'
  }
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'production') return null
  return (
    <span
      className={cx(
        'rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        badgeClass(status),
      )}
    >
      {status === 'experimental' ? 'Experimental' : status === 'beta' ? 'Beta' : 'Disabled'}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
      {icon && <div className="text-slate-400">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600',
      )}
    >
      <span
        className={cx(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export function ProgressBar({ value }: { value: number }) {
  const percent = Math.round(value)
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-600 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
export function Export({ text, filename = 'export.txt', mime = 'text/plain' }: { text: string; filename?: string; mime?: string }) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  return null
}

export function FileUploader({ types, multiple, onFiles }: { types?: string; multiple?: boolean; onFiles: (files: File[]) => void }) {
  return (<input type='file' accept={types} multiple={multiple} onChange={(e) => { if (e.target.files) onFiles(Array.from(e.target.files)) }} className='block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700' />)
}


export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

