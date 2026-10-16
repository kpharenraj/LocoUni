import type { Metadata } from 'next'
import Link from 'next/link'
import PublicPage from '@/components/site/PublicPage'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${site.name}, its campus information tools, and who it serves.`,
}

export default function AboutPage() {
  return (
    <PublicPage>
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            About {site.name}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{site.description}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">A clearer start on campus</h2>
          <p className="leading-relaxed text-muted-foreground">
            Starting at a university often means figuring out where buildings are, who to
            contact, and which notices matter while information is spread across different
            places. {site.name} brings those campus essentials together so new students can
            find their way and get oriented.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">Who {site.name} is for</h2>
          <p className="leading-relaxed text-muted-foreground">
            University administrators can publish and maintain information about their
            institution. Students can use that information to explore their campus, find
            faculty, read notices, and ask the campus assistant questions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">Campus information in one place</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
            <li>A campus map with locations added by university administrators.</li>
            <li>A faculty and staff directory with available contact and location details.</li>
            <li>A notice board for university updates.</li>
            <li>An AI assistant that answers using available campus information.</li>
          </ul>
        </section>

        <section id="founder" className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold tracking-tight">Built by {site.ownerName}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {site.name} is built by {site.ownerName}, {site.ownerRole} and owner of{' '}
            {site.organization}.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href={site.social.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              GitHub profile
            </a>
            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              LinkedIn profile
            </a>
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Contact {site.ownerName}
            </Link>
          </div>
        </section>
      </article>
    </PublicPage>
  )
}
