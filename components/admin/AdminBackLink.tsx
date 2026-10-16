import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminBackLink() {
  return (
    <Link
      href="/admin"
      className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-muted-foreground dark:hover:text-indigo-400"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>Back to dashboard</span>
    </Link>
  )
}
