'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, X } from 'lucide-react'

type ToastItem = {
  id: number
  message: string
  type: 'success' | 'error'
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastItem['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, type }])
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 4000)
    )
    return () => timers.forEach(window.clearTimeout)
  }, [toasts, dismissToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex min-h-10 max-w-sm items-center gap-3 rounded-xl border px-4 py-2.5 text-sm shadow-lg ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-card text-foreground dark:border-emerald-900 dark:bg-card dark:text-foreground'
                : 'border-red-200 bg-card text-red-800 dark:border-red-900 dark:bg-card dark:text-red-200'
            }`}
          >
            <CheckCircle2
              className={`h-4 w-4 shrink-0 ${
                toast.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
              }`}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 break-words">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider.')
  return context
}
