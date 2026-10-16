'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, House } from 'lucide-react'

export default function StudentError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Student campus route error', { digest: error.digest })
  }, [error.digest])

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">Campus page unavailable</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t load this campus page. Please return home and try again.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <House className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </section>
  )
}
