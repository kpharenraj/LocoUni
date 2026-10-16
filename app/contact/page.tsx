import type { Metadata } from 'next'
import PublicPage from '@/components/site/PublicPage'
import { createPageMetadata, site } from '@/lib/site'
import BreadcrumbJsonLd from '@/components/site/BreadcrumbJsonLd'

export const metadata: Metadata = createPageMetadata(
  'Contact',
  `Contact ${site.name} for support, university registration, privacy requests or bug reports.`,
  '/contact'
)

export default function ContactPage() {
  return (
    <PublicPage>
      <BreadcrumbJsonLd name="Contact" path="/contact" />
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact us</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Reach {site.name} by email. We aim to respond within a few working days.
          </p>
          <a
            href={`mailto:${site.contactEmail}`}
            className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline"
          >
            {site.contactEmail}
          </a>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">What can we help with?</h2>
          <dl className="divide-y divide-border rounded-2xl border border-border bg-card px-5">
            <div className="py-4">
              <dt className="font-semibold">Support</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                Questions about signing in, joining a university, or using the site.
              </dd>
            </div>
            <div className="py-4">
              <dt className="font-semibold">Universities wanting to join</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                University administrators can write to ask about registering their institution.
              </dd>
            </div>
            <div className="py-4">
              <dt className="font-semibold">Privacy requests</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                Request access to, correction of, or deletion of your account information.
              </dd>
            </div>
            <div className="py-4">
              <dt className="font-semibold">Bug reports</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                Describe what happened and the page or action where you saw the problem. Avoid
                sending passwords or other sensitive information.
              </dd>
            </div>
          </dl>
        </section>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Email{' '}
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {site.contactEmail}
          </a>
          . We expect to reply within a few working days.
        </p>
      </article>
    </PublicPage>
  )
}
