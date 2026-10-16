'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  GraduationCap,
  MapPin,
  ChevronRight,
  Loader2,
  Building2,
  Plus,
} from 'lucide-react'
import LegalLinks from '@/components/site/LegalLinks'

interface UniversityResult {
  id: string
  name: string
  city: string | null
  country: string | null
  logo_url: string | null
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// Escape % and _ so they are treated as literals in ilike
function escapeIlike(str: string): string {
  return str.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export default function JoinPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UniversityResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setSearchError(null)

    const supabase = createClient()
    const escaped = escapeIlike(q.trim())
    const pattern = `%${escaped}%`

    const { data, error } = await supabase
      .from('universities')
      .select('id, name, city, country, logo_url')
      .eq('status', 'approved')
      .or(`name.ilike.${pattern},city.ilike.${pattern}`)
      .order('name', { ascending: true })
      .limit(10)

    if (error) {
      setSearchError('We could not search universities right now. Please try again.')
      setResults([])
      setIsLoading(false)
      return
    }

    setResults(data || [])
    setIsLoading(false)
  }, [])

  // 300 ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-background text-foreground dark:text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 dark:border-border/80 bg-card/80 dark:bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground dark:text-foreground"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>LocoUni</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Find your university
          </h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-md mx-auto">
            Search by university name or city to access the campus map, faculty directory, and notice board.
          </p>
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
          <input
            type="text"
            id="university-search"
            aria-label="Search universities by name or city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city..."
            autoComplete="off"
            className="w-full pl-12 pr-12 py-3.5 text-sm rounded-2xl border border-border dark:border-border bg-card dark:bg-card text-foreground dark:text-foreground placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Results */}
        {searchError && (
          <p role="alert" className="py-8 text-center text-sm text-red-600 dark:text-red-400">
            {searchError}
          </p>
        )}
        {hasSearched && !isLoading && !searchError && results.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 text-muted-foreground dark:text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground dark:text-muted-foreground mb-1">
              No universities found
            </h3>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground max-w-xs mx-auto mb-5">
              Can&apos;t find your university? The admin needs to register it first.
            </p>
            <Link
              href="/add-university"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register a University</span>
            </Link>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((uni) => (
              <Link
                key={uni.id}
                href={`/join/${uni.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-card dark:bg-card border border-border dark:border-border hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all"
              >
                {/* Logo or initials */}
                <div className="w-12 h-12 rounded-xl border border-border dark:border-border bg-muted dark:bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uni.logo_url ? (
                    <Image
                      src={uni.logo_url}
                      alt={uni.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {getInitials(uni.name)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground dark:text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {uni.name}
                  </h3>
                  {(uni.city || uni.country) && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {[uni.city, uni.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Initial hint */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-8 text-xs text-muted-foreground dark:text-muted-foreground">
            Start typing to search for approved universities
          </div>
        )}

        {/* Register hint at bottom */}
        <div className="mt-12 text-center text-xs text-muted-foreground dark:text-muted-foreground">
          Are you an admin?{' '}
          <Link href="/add-university" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register your university
          </Link>
        </div>
      </main>
      <LegalLinks />
    </div>
  )
}
