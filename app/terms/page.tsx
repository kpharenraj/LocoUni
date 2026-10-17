import type { Metadata } from 'next'
import PublicPage from '@/components/site/PublicPage'
import { createPageMetadata, site, siteLastUpdated } from '@/lib/site'
import BreadcrumbJsonLd from '@/components/site/BreadcrumbJsonLd'

export const metadata: Metadata = createPageMetadata(
  'Terms of Use',
  `Review the terms for using ${site.name}, including accounts, acceptable use and AI assistant guidance.`,
  '/terms'
)

export default function TermsPage() {
  return (
    <PublicPage>
      <BreadcrumbJsonLd name="Terms of Use" path="/terms" />
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">Last updated: {siteLastUpdated}</p>
          <p className="leading-relaxed text-muted-foreground">
            These terms describe the use of {site.name}. {site.name} is operated by{' '}
            {site.ownerName}, trading as {site.organization}, {site.organizationDescription}.
          </p>
        </header>

        <section className="space-y-6 leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-bold text-foreground">1. Acceptance</h2>
            <p className="mt-2">
              By accessing or using {site.name}, you agree to these terms. If you do not agree,
              do not use the service.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">2. Accounts and eligibility</h2>
            <p className="mt-2">
              Keep your account credentials secure and provide accurate account information.
              You are responsible for activity carried out through your account. If you are
              under 18, ask a parent, guardian, or your institution for guidance before using
              the service.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">3. Acceptable use</h2>
            <p className="mt-2">
              Use {site.name} lawfully and respectfully. Do not attempt to disrupt, abuse, or
              gain unauthorized access to the service, submit harmful or unlawful material, or
              misuse another person’s information.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">4. University-published content</h2>
            <p className="mt-2">
              University administrators are responsible for ensuring that the locations,
              faculty details, photos, and notices they publish are accurate, appropriate, and
              shared with permission. Published campus content may be publicly readable.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">5. AI assistant</h2>
            <p className="mt-2">
              Assistant answers are generated from available campus information and may be
              incorrect, incomplete, or out of date. They are provided for general guidance,
              not as an authoritative university communication. Verify important information
              directly with your university.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">6. University approval and removal</h2>
            <p className="mt-2">
              A university registration remains pending until it is approved. {site.name} may
              decline, suspend, or remove a university or its published content where needed
              to protect the service, comply with law, or address misuse.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">7. Availability</h2>
            <p className="mt-2">
              We work to keep {site.name} available, but do not guarantee uninterrupted,
              error-free, or permanent availability. Features may change or be unavailable
              during maintenance or for other operational reasons.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">8. Intellectual property</h2>
            <p className="mt-2">
              The service and its original materials are owned by {site.ownerName}, trading
              as {site.organization}, or its licensors. University administrators retain
              responsibility for content they submit and must have the rights needed to
              publish it. You may use the service for its intended purpose, subject to these
              terms.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">9. Limitation of liability</h2>
            <p className="mt-2">
              To the extent permitted by applicable law, {site.ownerName}, trading as{' '}
              {site.organization}, is not liable for indirect or consequential loss, reliance
              on inaccurate campus or AI-generated information, or interruptions outside
              the operator’s reasonable control. Nothing in these terms excludes liability
              that cannot lawfully be excluded.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">10. Termination</h2>
            <p className="mt-2">
              You may stop using {site.name} at any time. We may suspend or terminate access
              for violations of these terms or where necessary for legal, safety, or
              operational reasons.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">11. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. The updated date above indicates
              when this page was last revised. Continued use after an update means you accept
              the revised terms.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">12. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of India, subject to applicable legal
              requirements.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">13. Contact</h2>
            <p className="mt-2">
              Questions about these terms can be sent to {site.ownerName}, trading as{' '}
              {site.organization}, at{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {site.contactEmail}
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </PublicPage>
  )
}
