'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, House } from 'lucide-react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application route error', { digest: error.digest })
  }, [error.digest])

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
        We couldn&apos;t load this page. Please try again later or return to the home page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <House className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </main>
  )
}
