import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminBackLink from '@/components/admin/AdminBackLink'
import UniversitySettingsForm from './university-settings-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'University Settings' }

export default async function UniversitySettingsPage() {
  const { universityId } = await requireAdmin()
  const supabase = await createClient()
  const { data: university, error } = await supabase
    .from('universities')
    .select('name, city, country, website, description, logo_url, lat, lng, status')
    .eq('id', universityId)
    .maybeSingle()

  if (error) throw new Error('Unable to load university settings.')
  if (!university) notFound()

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground dark:bg-background dark:text-foreground sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <AdminBackLink />
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Admin</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">University settings</h1>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              university.status === 'approved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                : university.status === 'pending'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                  : 'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground'
            }`}
          >
            {university.status === 'approved' ? 'Approved' : university.status === 'pending' ? 'Pending' : university.status}
          </span>
        </div>
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-card sm:p-7">
          <UniversitySettingsForm
            initialValues={{
              name: university.name,
              city: university.city ?? '',
              country: university.country ?? '',
              website: university.website ?? '',
              description: university.description ?? '',
              logoUrl: university.logo_url,
              lat: university.lat,
              lng: university.lng,
            }}
          />
        </section>
      </div>
    </main>
  )
}
