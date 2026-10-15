'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, MapPin, Phone, Search, Users } from 'lucide-react'

interface FacultyLocation {
  id: string
  name: string
  lat: number | null
  lng: number | null
}

export interface StudentFacultyMember {
  id: string
  name: string
  role: string | null
  department: string | null
  cabin_number: string | null
  photo_url: string | null
  email: string | null
  phone: string | null
  locations: FacultyLocation | null
}

interface StudentFacultyDirectoryProps {
  universityId: string
  faculty: StudentFacultyMember[]
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export default function StudentFacultyDirectory({
  universityId,
  faculty,
}: StudentFacultyDirectoryProps) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          faculty
            .map((member) => member.department?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [faculty]
  )

  const filteredFaculty = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return faculty.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          member.name,
          member.role,
          member.department,
          member.cabin_number,
        ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))
      const matchesDepartment =
        department === 'all' || member.department?.trim() === department

      return matchesQuery && matchesDepartment
    })
  }, [department, faculty, query])

  const clearFilters = () => {
    setQuery('')
    setDepartment('all')
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Your campus directory
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Faculty &amp; staff
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Search people by name, role, department, or cabin number.
        </p>
      </header>

      <section
        aria-label="Search and filter faculty"
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)]"
      >
        <label className="relative block">
          <span className="sr-only">Search faculty</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, role, department, or cabin..."
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        <label className="block">
          <span className="sr-only">Filter by department</span>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="all">All departments</option>
            {departments.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {filteredFaculty.length} {filteredFaculty.length === 1 ? 'person' : 'people'}
        </p>
        {(query || department !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFaculty.map((member) => (
            <article
              key={member.id}
              className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-indigo-50 text-sm font-bold text-indigo-700 dark:border-zinc-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(member.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-base font-bold leading-snug">
                    {member.name}
                  </h2>
                  {member.role && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {member.role}
                    </p>
                  )}
                  {member.department && (
                    <span className="mt-2 inline-flex max-w-full items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <span className="truncate">{member.department}</span>
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 text-sm">
                {member.cabin_number && (
                  <div className="flex items-start gap-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Cabin number</dt>
                      <dd className="text-zinc-700 dark:text-zinc-300">
                        Cabin {member.cabin_number}
                      </dd>
                    </div>
                  </div>
                )}
                {member.locations && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Campus location</dt>
                      <dd className="text-zinc-700 dark:text-zinc-300">
                        {member.locations.name}
                      </dd>
                    </div>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${member.email}`}
                          className="break-all text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {member.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${member.phone}`}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {member.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              {member.locations && (
                <Link
                  href={`/u/${universityId}/map?focus=${encodeURIComponent(member.locations.id)}`}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  View on map
                </Link>
              )}
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Users className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
          <h2 className="mt-3 text-base font-bold">No faculty found</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {faculty.length === 0
              ? 'There are no faculty members listed yet.'
              : 'Try a different search or department filter.'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  )
}
