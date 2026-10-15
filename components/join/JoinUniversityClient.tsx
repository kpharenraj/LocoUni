'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  studentJoinAction,
  studentSignupAndJoinAction,
  type JoinActionState,
} from '@/app/actions/join'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe,
  GraduationCap,
  Loader2,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

interface University {
  id: string
  name: string
  city: string | null
  country: string | null
  logo_url: string | null
  description: string | null
  website: string | null
}

interface CurrentUser {
  role: string | null
  universityId: string | null
}

interface JoinUniversityClientProps {
  university: University
  currentUser: CurrentUser | null
}

const INPUT_CLASS =
  'w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export default function JoinUniversityClient({
  university,
  currentUser,
}: JoinUniversityClientProps) {
  const signupAction = studentSignupAndJoinAction.bind(null, university.id)
  const [signupState, formAction, isSignupPending] = useActionState<JoinActionState, FormData>(
    signupAction,
    {}
  )
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isJoinPending, startJoinTransition] = useTransition()

  const handleJoin = () => {
    setJoinError(null)
    startJoinTransition(async () => {
      const result = await studentJoinAction(university.id)
      setJoinError(result.error ?? null)
    })
  }

  const isAdmin = currentUser?.role === 'admin'
  const isStudent = currentUser?.role === 'student'
  const alreadyJoined = isStudent && currentUser.universityId === university.id

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to search
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            LocoUni
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              {university.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={university.logo_url}
                  alt={`${university.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {getInitials(university.name)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {university.name}
              </h1>
              {(university.city || university.country) && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {[university.city, university.country].filter(Boolean).join(', ')}
                </p>
              )}
              {university.website && (
                <a
                  href={
                    university.website.startsWith('http')
                      ? university.website
                      : `https://${university.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Globe className="h-3 w-3" />
                  Visit university website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          {university.description && (
            <p className="mt-4 border-t border-zinc-100 pt-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {university.description}
            </p>
          )}
        </section>

        {isAdmin ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold">Admin accounts cannot join as students</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You are signed in as an administrator. Manage your university from the admin console.
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to admin console
            </Link>
          </section>
        ) : alreadyJoined ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-bold">You&apos;re already a member</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Your account is already connected to this university.
            </p>
            <Link
              href={`/u/${university.id}`}
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to campus
            </Link>
          </section>
        ) : isStudent ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold">Join this university</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Joining will update the university connected to your student account.
            </p>
            {joinError && (
              <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {joinError}
              </p>
            )}
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoinPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isJoinPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Join this university
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-lg font-bold">Create your student account</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Join {university.name} to access its campus portal.
                </p>
              </div>
            </div>

            {signupState.error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{signupState.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-1 block text-xs font-semibold">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className={INPUT_CLASS}
                  aria-invalid={Boolean(signupState.fieldErrors?.fullName)}
                />
                {signupState.fieldErrors?.fullName?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{signupState.fieldErrors.fullName[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={INPUT_CLASS}
                  aria-invalid={Boolean(signupState.fieldErrors?.email)}
                />
                {signupState.fieldErrors?.email?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{signupState.fieldErrors.email[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className={INPUT_CLASS}
                  aria-invalid={Boolean(signupState.fieldErrors?.password)}
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Use at least 8 characters.
                </p>
                {signupState.fieldErrors?.password?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{signupState.fieldErrors.password[0]}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSignupPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSignupPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account and join
              </button>
            </form>
            <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                Log in
              </Link>
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
