import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import {
  GraduationCap,
  Building2,
  MapPin,
  Users,
  Bell,
  Clock,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Globe,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin Console' }

export default async function AdminPage() {
  const { user, profile, universityId } = await requireAdmin()
  const supabase = await createClient()

  // Fetch university details
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('id', universityId)
    .maybeSingle()

  // Fetch locations count
  const { count: locationsCount } = await supabase
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('university_id', universityId)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span>LocoUni</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Admin Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                {profile.full_name || 'Administrator'}
              </span>
              <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                {user.email}
              </span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Status Banner */}
        {university?.status === 'pending' && (
          <div
            role="status"
            className="mb-8 rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 text-amber-900 dark:text-amber-200 flex items-start sm:items-center gap-3.5 shadow-xs"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">
                Your university is awaiting approval. You can start adding data now.
              </p>
              <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                While pending, your university is not yet searchable by students on the public directory.
              </p>
            </div>
            <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
              Pending
            </span>
          </div>
        )}

        {/* University Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
              {university?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={university.logo_url}
                  alt={`${university.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {university?.name || 'Your University'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    university?.status === 'approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                  }`}
                >
                  {university?.status === 'approved' ? 'Approved' : 'Pending Approval'}
                </span>
              </div>

              {university?.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 max-w-3xl line-clamp-2">
                  {university.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                {(university?.city || university?.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {[university.city, university.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {university?.website && (
                  <a
                    href={
                      university.website.startsWith('http')
                        ? university.website
                        : `https://${university.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{university.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {university?.lat && university?.lng && (
                  <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    GPS: {university.lat.toFixed(4)}, {university.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Campus Management
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Configure your university locations, faculty directory, and public notice board
            </p>
          </div>
        </div>

        {/* 3 Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Locations */}
          <Link
            href="/admin/locations"
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 group-hover:scale-105 transition-transform duration-200">
                  <MapPin className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {locationsCount !== null && locationsCount > 0
                    ? `${locationsCount} ${locationsCount === 1 ? 'place' : 'places'} mapped`
                    : 'Interactive Map'}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Locations
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Add and manage campus facilities, blocks, hostels, cafeterias, and pinpoint coordinates on the map.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Manage Locations</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Faculty */}
          <Link
            href="/admin/faculty"
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 transition-transform duration-200">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  Directory
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Faculty &amp; Staff
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Publish faculty profiles, departments, cabin/room numbers, contact details, and photos for students.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Manage Directory</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Notices */}
          <Link
            href="/admin/notices"
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 group-hover:scale-105 transition-transform duration-200">
                  <Bell className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  Announcements
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Notices
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Post academic notices, exam dates, hostel circulars, and highlight urgent alerts for your campus.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Manage Notices</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
