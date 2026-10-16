import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { site } from '@/lib/site'

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur dark:bg-background/80">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          {site.name}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/about"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            About
          </Link>
          <Link
            href="/how-it-works"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
