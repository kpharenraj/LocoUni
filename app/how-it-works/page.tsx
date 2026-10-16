import type { Metadata } from 'next'
import PublicPage from '@/components/site/PublicPage'
import { createPageMetadata, site } from '@/lib/site'
import BreadcrumbJsonLd from '@/components/site/BreadcrumbJsonLd'

export const metadata: Metadata = createPageMetadata(
  'How it works',
  `Learn how universities share campus information and how students use ${site.name}.`,
  '/how-it-works'
)

const universitySteps = [
  'Add the university and provide its basic details.',
  'Add locations and place them on the campus map.',
  'Add faculty information and photos.',
  'Publish notices for students.',
  'Wait for the university to be reviewed and approved before it appears in student search.',
]

const studentSteps = [
  'Find your approved university by its name or city.',
  'Join the university with a student account.',
  'Use the campus assistant to ask questions about available university information.',
  'Browse the faculty directory to find staff and available contact details.',
  'Explore the campus map and read the university notice board.',
]

function StepsSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-4 leading-relaxed text-muted-foreground">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function HowItWorksPage() {
  return (
    <PublicPage>
      <BreadcrumbJsonLd name="How it works" path="/how-it-works" />
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {site.name} gives universities a place to publish campus information and helps
            students find it when they need it.
          </p>
        </header>
        <div className="space-y-5">
          <StepsSection title="For universities" steps={universitySteps} />
          <StepsSection title="For students" steps={studentSteps} />
        </div>
      </article>
    </PublicPage>
  )
}
