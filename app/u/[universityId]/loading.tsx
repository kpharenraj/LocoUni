import { Loader2 } from 'lucide-react'

export default function StudentLoading() {
  return (
    <section
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-24 sm:px-6 md:pb-8"
      aria-label="Loading campus portal"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading your campus…
      </div>
      <div className="h-40 animate-pulse rounded-3xl bg-muted dark:bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-muted dark:bg-muted"
          />
        ))}
      </div>
    </section>
  )
}
