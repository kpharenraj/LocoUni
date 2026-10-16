import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 pb-24 sm:px-6 lg:px-8"
      aria-label="Loading admin console"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading your admin console…
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-muted dark:bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-muted dark:bg-muted"
          />
        ))}
      </div>
    </main>
  )
}
