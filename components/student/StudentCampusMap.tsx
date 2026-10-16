'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search } from 'lucide-react'
import type { MapLocation } from '@/components/map/CampusMap'
import LocationPhoto from '@/components/student/LocationPhoto'

const CampusMap = dynamic(() => import('@/components/map/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] min-h-[360px] w-full items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground">
      Loading campus map...
    </div>
  ),
})

interface StudentCampusMapProps {
  locations: MapLocation[]
  initialFocusId?: string
}

export default function StudentCampusMap({
  locations,
  initialFocusId,
}: StudentCampusMapProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(() =>
    locations.some((location) => location.id === initialFocusId)
      ? initialFocusId ?? null
      : null
  )

  const locationTypes = useMemo(
    () =>
      Array.from(new Set(locations.map((location) => location.type)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [locations]
  )

  const filteredLocations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return locations.filter((location) => {
      const matchesName =
        !normalizedSearch ||
        location.name.toLocaleLowerCase().includes(normalizedSearch)
      const matchesType =
        selectedType === 'all' || location.type === selectedType
      return matchesName && matchesType
    })
  }, [locations, search, selectedType])

  if (locations.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center dark:border-border dark:bg-card">
        <MapPin
          className="mx-auto h-10 w-10 text-muted-foreground dark:text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="mt-3 text-xl font-bold">No campus locations yet</h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
          Locations will appear here when they have been added by your university.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Explore your campus
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Campus map
        </h1>
      </header>

      <section aria-label="Filter campus locations" className="space-y-3">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search locations by name</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search campus locations..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder-zinc-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-border dark:bg-card dark:text-foreground"
          />
        </label>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {['all', ...locationTypes].map((type) => {
            const active = selectedType === type
            const label = type === 'all' ? 'All' : type
            const count =
              type === 'all'
                ? locations.length
                : locations.filter((location) => location.type === type).length

            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedType(type)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-indigo-300 hover:text-indigo-700 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-indigo-700 dark:hover:text-indigo-300'
                }`}
              >
                {label} <span className={active ? 'text-indigo-100' : 'text-muted-foreground'}>({count})</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.8fr)]">
        <section aria-label="Interactive campus map" className="min-w-0">
          {filteredLocations.length > 0 ? (
            <CampusMap
              locations={filteredLocations}
              focusedLocationId={
                filteredLocations.some((location) => location.id === focusedLocationId)
                  ? focusedLocationId
                  : null
              }
              onPinClick={setFocusedLocationId}
              height="60vh"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card px-5 text-center text-sm text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground">
              No campus places match these filters. Try a different search or location type.
            </div>
          )}
        </section>

        <section
          aria-label="Campus locations"
          className="overflow-hidden rounded-2xl border border-border bg-card dark:border-border dark:bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-border">
            <h2 className="text-sm font-bold">Locations</h2>
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
              {filteredLocations.length} of {locations.length}
            </span>
          </div>

          {filteredLocations.length > 0 ? (
            <ul className="divide-y divide-zinc-100 md:max-h-[60vh] md:overflow-y-auto dark:divide-zinc-800">
              {filteredLocations.map((location) => {
                const isFocused = location.id === focusedLocationId
                return (
                  <li key={location.id}>
                    <button
                      type="button"
                      onClick={() => setFocusedLocationId(location.id)}
                      aria-pressed={isFocused}
                      className={`w-full px-4 py-3.5 text-left transition-colors ${
                        isFocused
                          ? 'bg-indigo-50 dark:bg-indigo-950/40'
                          : 'hover:bg-background dark:hover:bg-muted/60'
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <MapPin
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isFocused
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-muted-foreground'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="font-semibold text-foreground dark:text-foreground">
                              {location.name}
                            </span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                              {location.type}
                            </span>
                          </span>
                          {location.description && (
                            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground">
                              {location.description}
                            </span>
                          )}
                          {location.faculty && location.faculty.length > 0 && (
                            <span className="mt-2 block space-y-1">
                              {location.faculty.map((member) => (
                                <span
                                  key={member.id}
                                  className="block text-xs text-muted-foreground dark:text-muted-foreground"
                                >
                                  {member.name}
                                  {member.cabin_number && ` · Cabin ${member.cabin_number}`}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                    {location.photo_url && (
                      <div className="px-4 pb-4 pl-11">
                        <LocationPhoto
                          src={location.photo_url}
                          alt={`${location.name} location`}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground dark:text-muted-foreground">
              No locations match these filters.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
