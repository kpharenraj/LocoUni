import type { Metadata } from 'next'
import PublicPage from '@/components/site/PublicPage'
import { site, siteLastUpdated } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn what information ${site.name} handles and how it is used.`,
}

export default function PrivacyPage() {
  return (
    <PublicPage>
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {siteLastUpdated}</p>
          <p className="leading-relaxed text-muted-foreground">
            This policy describes information handled by {site.name} and how it is used to
            provide the service.
          </p>
        </header>

        <section className="space-y-6 leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-bold text-foreground">Information we handle</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Account information:</strong> your name,
                email address, account role, and joined university. Supabase Auth processes
                your password and stores it in protected, hashed form; {site.name} does not store
                a readable password in its application tables.
              </li>
              <li>
                <strong className="text-foreground">University content:</strong> university
                administrators can publish university details, campus locations, photos,
                faculty and staff details, and notices. These entries are stored in Supabase
                and the app makes campus content publicly readable.
              </li>
              <li>
                <strong className="text-foreground">Assistant rate-limit records:</strong>{' '}
                when a request passes the rate-limit check and is sent to Gemini, {site.name}
                records the account’s user ID and a timestamp to enforce the hourly usage
                limit. The app does not save a chat transcript in its database.
              </li>
              <li>
                <strong className="text-foreground">Chat requests:</strong> the messages in
                your current assistant request and relevant campus information are sent to
                Google’s Gemini API to generate a response. The current request is not saved
                as conversation history by {site.name}. For a request containing one user
                message, the server may temporarily cache that message and its answer in
                memory for up to 10 minutes to reuse the response.
              </li>
              <li>
                <strong className="text-foreground">Technical and preference data:</strong>{' '}
                Supabase Auth uses session cookies to maintain login state. The theme
                preference is stored in your browser. The app does not request precise
                location from the visitor.
              </li>
              <li>
                <strong className="text-foreground">Map requests:</strong> when a map is
                displayed, the browser requests map tiles from OpenStreetMap tile servers.
                Those requests disclose your IP address to the tile provider.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">How information is used</h2>
            <p className="mt-2">
              We use account and university information to provide sign-in, associate
              students with a university, display campus content, operate the assistant,
              apply chat rate limits, and maintain the service. Contact details are used to
              respond to the requests you send us.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Service providers</h2>
            <p className="mt-2">
              {site.name} uses Supabase for authentication, database, and image storage;
              Vercel for hosting; and Google Gemini to generate assistant answers. Map tiles
              are requested from OpenStreetMap tile servers. These providers process data
              needed to deliver their respective services and may handle it under their own
              terms and privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Retention</h2>
            <p className="mt-2">
              Account information is kept while the account is active. Published university
              content remains available until an authorized administrator or operator
              changes or removes it. Rate-limit records include a user ID and timestamp; the
              application uses recent timestamps to enforce its hourly limit but does not
              configure an automatic deletion period for older records. The database removes
              these records if the associated authentication account is deleted. The app
              does not store chat transcripts. Provider infrastructure may retain data under
              its own policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Security</h2>
            <p className="mt-2">
              The service uses Supabase Auth, server-side access controls, and database
              policies to help protect account and university data. No online service can
              guarantee absolute security, so do not include passwords or highly sensitive
              personal information in published campus content or assistant messages.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Your choices and rights</h2>
            <p className="mt-2">
              You may request access to, correction of, or deletion of your account
              information by emailing{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {site.contactEmail}
              </a>
              . Please describe your request and use the email address associated with your
              account. We may need to verify your identity and may retain information where
              required by law or needed to protect the service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Users under 18</h2>
            <p className="mt-2">
              If you are under 18, ask a parent, guardian, or your educational institution
              whether using the service is appropriate for you. Do not submit sensitive
              personal information in public campus content or chat messages.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy as the service changes. We will revise the date at
              the top when we make an update. Please review this page periodically.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2">
              For privacy questions or requests, contact {site.organization} at{' '}
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
