import Link from 'next/link'
import { Users } from 'lucide-react'

export default function AdminFacultyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Faculty &amp; Staff</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Faculty and staff directory management module will be built in the next step.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to Admin Console
        </Link>
      </div>
    </div>
  )
}
