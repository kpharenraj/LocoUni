import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  Map,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface StudentHomePageProps {
  params: Promise<{ universityId: string }>
}

const QUICK_LINKS = [
  {
    segment: 'assistant',
    title: 'Campus assistant',
    description: 'Ask a question about your campus.',
    icon: Bot,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  {
    segment: 'faculty',
    title: 'Faculty directory',
    description: 'Find faculty and staff details.',
    icon: Users,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  },
  {
    segment: 'map',
    title: 'Campus map',
    description: 'Explore campus places and facilities.',
    icon: Map,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  {
    segment: 'notices',
    title: 'Notice board',
    description: 'Keep up with university updates.',
    icon: Bell,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
]

export const dynamic = 'force-dynamic'

export default async function StudentHomePage({
  params,
}: StudentHomePageProps) {
  const { universityId } = await params
  const supabase = await createClient()

  const [
    { data: university, error: universityError },
    { data: notices, error: noticesError },
    { data: authData, error: authError },
  ] = await Promise.all([
    supabase
      .from('universities')
      .select('id, name, description, logo_url')
      .eq('id', universityId)
      .maybeSingle(),
    supabase
      .from('notices')
      .select('id, title, body, priority, created_at')
      .eq('university_id', universityId)
      .in('priority', ['urgent', 'high'])
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.auth.getUser(),
  ])

  if (universityError) {
    throw new Error(`Failed to load university: ${universityError.message}`)
  }
  if (noticesError) {
    throw new Error(`Failed to load important notices: ${noticesError.message}`)
  }
  if (authError || !authData.user) {
    throw new Error('Failed to verify the signed-in student.')
  }
  if (!university) {
    notFound()
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to load student profile: ${profileError.message}`)
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-indigo-100">
          Your campus, all in one place
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-indigo-100 sm:text-base">
          Find what you need at {university.name}.
        </p>
        {university.description && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/90">
            {university.description}
          </p>
        )}
      </section>

      <section aria-labelledby="important-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Stay informed
            </p>
            <h2 id="important-heading" className="mt-1 text-xl font-bold tracking-tight">
              Important now
            </h2>
          </div>
          <Link
            href={`/u/${universityId}/notices`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            All notices <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {notices.length > 0 ? (
          <div className="grid gap-3">
            {notices.map((notice) => (
              <article
                key={notice.id}
                className={`rounded-2xl border p-4 ${
                  notice.priority === 'urgent'
                    ? 'border-red-300/80 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20'
                    : 'border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      notice.priority === 'urgent'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        notice.priority === 'urgent'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {notice.priority}
                    </span>
                    <h3 className="mt-0.5 text-sm font-bold">{notice.title}</h3>
                    {notice.body && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {notice.body}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No urgent or high-priority notices right now.
          </div>
        )}
      </section>

      <section aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="mb-4 text-xl font-bold tracking-tight">
          Explore your campus
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ segment, title, description, icon: Icon, color }) => (
            <Link
              key={segment}
              href={`/u/${universityId}/${segment}`}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{title}</span>
                <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                  {description}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
