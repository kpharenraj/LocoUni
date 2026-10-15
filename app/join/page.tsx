import Link from 'next/link'

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Join University</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Select or search for your university to access campus maps, faculty directory, and notices.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to LocoUni Home
        </Link>
      </div>
    </div>
  )
}
