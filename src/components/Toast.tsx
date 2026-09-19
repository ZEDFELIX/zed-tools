import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cx } from '../lib/utils'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
    }
  }
  return context
}

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const COLORS: Record<ToastKind, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-brand-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++counter.current
      setToasts((current) => [...current, { id, message, kind }])
      setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <div
        className="fixed bottom-20 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind]
          return (
            <div
              key={toast.id}
              className={cx(
                'flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10',
                'animate-[slideIn_0.2s_ease-out]',
              )}
              role="alert"
            >
              <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', COLORS[toast.kind])} aria-hidden />
              <p className="text-sm text-slate-700 dark:text-slate-200">{toast.message}</p>
              <button
                className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => remove(toast.id)}
                aria-label="Dismiss notification"
              >
                <XCircle className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}