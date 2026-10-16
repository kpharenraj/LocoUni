'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type LoginActionState } from '@/app/actions/auth'
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

const initialState: LoginActionState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background dark:bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground dark:text-foreground transition-transform hover:scale-105"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </span>
            <span>LocoUni</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground dark:text-foreground sm:text-3xl">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
            Enter your university credentials to access your campus portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border p-8 shadow-sm">
          {state?.error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium">Authentication Error</p>
                <p className="mt-0.5 text-red-600 dark:text-red-300/90">{state.error}</p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@university.edu"
                  className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-4 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    state?.fieldErrors?.email
                      ? 'border-red-400 dark:border-red-700 focus:border-red-500'
                      : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                  }`}
                />
              </div>
              {state?.fieldErrors?.email && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-4 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    state?.fieldErrors?.password
                      ? 'border-red-400 dark:border-red-700 focus:border-red-500'
                      : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                  }`}
                />
              </div>
              {state?.fieldErrors?.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-2.5 px-4 text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border dark:border-border text-center">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              New here?{' '}
              <Link
                href="/join"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Join a university
              </Link>{' '}
              or{' '}
              <Link
                href="/add-university"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                register as campus admin
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors"
          >
            ← Back to LocoUni Home
          </Link>
        </div>
      </div>
    </div>
  )
}
