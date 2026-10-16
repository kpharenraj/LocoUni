import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { logoutAction } from '@/app/actions/auth'
import {
  GraduationCap,
  Building2,
  Compass,
  ArrowRight,
  MapPin,
  Users,
  Bell,
  Sparkles,
  LogOut,
  LogIn,
  ShieldCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const userWithProfile = await getCurrentUserWithProfile()
  const user = userWithProfile?.user
  const profile = userWithProfile?.profile

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>LocoUni</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {profile?.role === 'admin' ? 'Campus Admin' : 'Student'}
                  </span>
                  <span className="text-zinc-400">|</span>
                  <span className="text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>

                {profile?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                ) : profile?.university_id ? (
                  <Link
                    href={`/u/${profile.university_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    Campus Portal
                  </Link>
                ) : null}

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Campus Navigation & Information Hub</span>
          </div>

          {/* Hero Section */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-2xl leading-[1.15]">
            Your campus, all in one place.
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Find faculty offices, navigate campus places, and stay up to date with university notices.
            Students can also ask a campus assistant for a quick answer.
          </p>

          {/* Feature Highlights Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Interactive Campus Maps</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Faculty Directory & Cabins</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Live Campus Notices</span>
            </div>
          </div>

          {/* Two Large Action Cards / Buttons */}
          <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Card 1: Add University */}
            <Link
              href="/add-university"
              className="group relative flex flex-col justify-between p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    For Administrators
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Add University
                </h2>

                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Register your campus, map key locations, and publish faculty &amp; notices.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Register campus</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Join University */}
            <Link
              href="/join"
              className="group relative flex flex-col justify-between p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 group-hover:scale-110 transition-transform duration-200">
                    <Compass className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    For Students
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Join University
                </h2>

                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Find your university to explore campus maps, contact professors, and track notices.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Select university</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>

        <section className="mt-14 w-full max-w-4xl" aria-labelledby="how-it-works-heading">
          <h2
            id="how-it-works-heading"
            className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          >
            How it works
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h3 className="text-base font-bold">For administrators</h3>
              <ol className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="font-bold text-indigo-600">1.</span><span>Register your university for review.</span></li>
                <li className="flex gap-3"><span className="font-bold text-indigo-600">2.</span><span>Add campus locations and map their pins.</span></li>
                <li className="flex gap-3"><span className="font-bold text-indigo-600">3.</span><span>Publish faculty details and campus notices.</span></li>
              </ol>
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h3 className="text-base font-bold">For students</h3>
              <ol className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="font-bold text-emerald-600">1.</span><span>Find and join your university.</span></li>
                <li className="flex gap-3"><span className="font-bold text-emerald-600">2.</span><span>Explore the faculty directory, map, and notices.</span></li>
                <li className="flex gap-3"><span className="font-bold text-emerald-600">3.</span><span>Ask the campus assistant when you need help.</span></li>
              </ol>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} LocoUni · Helping campus communities find their way.</p>
      </footer>
    </div>
  )
}
