import Link from 'next/link'

export default function LegalLinks() {
  return (
    <footer className="w-full border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
      <nav aria-label="Legal" className="flex items-center justify-center gap-2">
        <Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
          Terms
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
          Privacy
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/contact" className="underline-offset-4 hover:text-foreground hover:underline">
          Contact
        </Link>
      </nav>
    </footer>
  )
}
