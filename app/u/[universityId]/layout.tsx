import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import StudentNavigation from '@/components/student/StudentNavigation'
import { createClient } from '@/lib/supabase/server'

interface StudentLayoutProps {
  children: React.ReactNode
  params: Promise<{ universityId: string }>
}

export const dynamic = 'force-dynamic'

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export default async function StudentLayout({
  children,
  params,
}: StudentLayoutProps) {
  const { universityId } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, university_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to load student profile: ${profileError.message}`)
  }
  if (profile?.role === 'admin') {
    redirect('/admin')
  }
  if (profile?.role !== 'student') {
    redirect('/join')
  }
  if (!profile.university_id) {
    redirect('/join')
  }
  if (profile.university_id !== universityId) {
    redirect(`/u/${profile.university_id}`)
  }

  const { data: university, error: universityError } = await supabase
    .from('universities')
    .select('id, name, logo_url')
    .eq('id', universityId)
    .maybeSingle()

  if (universityError) {
    throw new Error(`Failed to load university: ${universityError.message}`)
  }
  if (!university) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={`/u/${university.id}`}
            className="flex min-w-0 items-center gap-3"
            aria-label={`${university.name} home`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              {university.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={university.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {getInitials(university.name)}
                </span>
              )}
            </span>
            <span className="truncate text-sm font-bold tracking-tight sm:text-base">
              {university.name}
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </form>
        </div>
        <StudentNavigation universityId={university.id} placement="desktop" />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-24 md:pb-8">
        {children}
      </main>
      <StudentNavigation universityId={university.id} placement="mobile" />
    </div>
  )
}
