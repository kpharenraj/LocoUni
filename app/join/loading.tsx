import { Loader2 } from 'lucide-react'

export default function JoinLoading() {
  return (
    <main
      className="mx-auto min-h-[60vh] max-w-2xl px-4 py-10"
      aria-label="Loading university search"
    >
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-9 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mb-6 h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
        Loading universities…
      </div>
    </main>
  )
}
