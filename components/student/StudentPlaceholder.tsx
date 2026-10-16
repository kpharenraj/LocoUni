import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

interface StudentPlaceholderProps {
  title: string
  description: string
  icon: ReactNode
  homeHref: string
}

export default function StudentPlaceholder({
  title,
  description,
  icon,
  homeHref,
}: StudentPlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
        {icon}
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
        {description}
      </p>
      <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground">
        This campus feature is coming soon.
      </p>
      <Link
        href={homeHref}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Return to campus home <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
