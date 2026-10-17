import Link from 'next/link'
import { site } from '@/lib/site'

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 dark:bg-background">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
        <div>
          <Link href="/" className="text-base font-bold tracking-tight">
            {site.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{site.tagline}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {site.organization}. Built by{' '}
            <Link href="/about#founder" className="font-medium hover:text-foreground">
              {site.ownerName}
            </Link>.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
