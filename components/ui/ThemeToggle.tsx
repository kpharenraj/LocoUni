'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Check, Monitor, Moon, Sun } from 'lucide-react'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function ThemeToggle() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose color theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
        <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close theme menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label="Color theme"
            className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            {options.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={theme === value}
                onClick={() => {
                  setTheme(value)
                  setOpen(false)
                }}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {theme === value && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
