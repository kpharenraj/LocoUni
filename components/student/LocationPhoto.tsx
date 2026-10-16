'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function LocationPhoto({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
          onClick={(event) => {
            event.stopPropagation()
            setOpen(true)
          }}
        aria-label={`View larger photo: ${alt}`}
        className={`block w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-indigo-600 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
      </button>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 dark:bg-black/85"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="relative max-h-[90dvh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close photo"
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[90dvh] w-full rounded-xl object-contain"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
