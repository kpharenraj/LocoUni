'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Siren,
} from 'lucide-react'
import type { NoticeCategory, NoticePriority } from '@/lib/validation'

export interface StudentNotice {
  id: string
  title: string
  body: string | null
  category: NoticeCategory
  priority: NoticePriority
  event_date: string | null
  created_at: string | null
}

interface StudentNoticeBoardProps {
  notices: StudentNotice[]
  now: string
}

const CATEGORIES: { value: NoticeCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'exams', label: 'Exams' },
  { value: 'placements', label: 'Placements' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'events', label: 'Events' },
  { value: 'hostel', label: 'Hostel' },
]

const PRIORITIES: { value: NoticePriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
]

const PRIORITY_ORDER: Record<NoticePriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
}

function formatRelativeDate(isoDate: string | null, nowIso: string): string {
  if (!isoDate) return 'Recently posted'

  const postedTime = new Date(isoDate).getTime()
  const nowTime = new Date(nowIso).getTime()
  if (!Number.isFinite(postedTime)) return 'Recently posted'

  const differenceInSeconds = Math.floor((nowTime - postedTime) / 1000)
  const absoluteSeconds = Math.abs(differenceInSeconds)
  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absoluteSeconds < 60) return relativeTime.format(-differenceInSeconds, 'second')
  if (absoluteSeconds < 3600) {
    return relativeTime.format(-Math.round(differenceInSeconds / 60), 'minute')
  }
  if (absoluteSeconds < 86400) {
    return relativeTime.format(-Math.round(differenceInSeconds / 3600), 'hour')
  }
  if (absoluteSeconds < 604800) {
    return relativeTime.format(-Math.round(differenceInSeconds / 86400), 'day')
  }
  if (absoluteSeconds < 2629800) {
    return relativeTime.format(-Math.round(differenceInSeconds / 604800), 'week')
  }
  if (absoluteSeconds < 31557600) {
    return relativeTime.format(-Math.round(differenceInSeconds / 2629800), 'month')
  }
  return relativeTime.format(-Math.round(differenceInSeconds / 31557600), 'year')
}

function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (!Number.isFinite(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: isoDate.includes('T') ? 'short' : undefined,
  }).format(date)
}

function getPriorityStyles(priority: NoticePriority): string {
  if (priority === 'urgent') {
    return 'border-red-300 bg-red-50/80 dark:border-red-900/60 dark:bg-red-950/25'
  }
  if (priority === 'high') {
    return 'border-amber-300 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20'
  }
  return 'border-border bg-card dark:border-border dark:bg-card'
}

function getPriorityBadgeStyles(priority: NoticePriority): string {
  if (priority === 'urgent') {
    return 'border-red-200 bg-red-100 text-red-800 dark:border-red-900/70 dark:bg-red-950/70 dark:text-red-300'
  }
  if (priority === 'high') {
    return 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/70 dark:text-amber-300'
  }
  return 'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground'
}

function NoticeCard({ notice, now }: { notice: StudentNotice; now: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <article
      className={`rounded-2xl border p-4 shadow-xs sm:p-5 ${getPriorityStyles(notice.priority)}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getPriorityBadgeStyles(notice.priority)}`}
        >
          {(notice.priority === 'urgent' || notice.priority === 'high') && (
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          )}
          {notice.priority}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-2.5 py-1 text-[10px] font-semibold capitalize text-muted-foreground dark:border-border dark:bg-card/70 dark:text-muted-foreground">
          {notice.category === 'emergency' && (
            <Siren className="h-3 w-3 text-red-600 dark:text-red-400" aria-label="Emergency" />
          )}
          {notice.category}
        </span>
      </div>

      <h2 className="mt-3 text-base font-bold leading-snug text-foreground dark:text-foreground sm:text-lg">
        {notice.title}
      </h2>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Posted {formatRelativeDate(notice.created_at, now)}
        </span>
        {notice.event_date && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Event: {formatEventDate(notice.event_date)}
          </span>
        )}
      </div>

      {notice.body && (
        <div className="mt-3">
          <p
            className={`whitespace-pre-line text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            {notice.body}
          </p>
          {notice.body.length > 160 && (
            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              aria-expanded={isExpanded}
              className="mt-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default function StudentNoticeBoard({
  notices,
  now,
}: StudentNoticeBoardProps) {
  const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<NoticePriority | 'all'>('all')

  const sortedNotices = useMemo(
    () =>
      [...notices].sort((a, b) => {
        const priorityDifference =
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (priorityDifference !== 0) return priorityDifference
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        )
      }),
    [notices]
  )

  const filteredNotices = sortedNotices.filter(
    (notice) =>
      (categoryFilter === 'all' || notice.category === categoryFilter) &&
      (priorityFilter === 'all' || notice.priority === priorityFilter)
  )

  const filtersAreActive =
    categoryFilter !== 'all' || priorityFilter !== 'all'

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Campus updates
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Notice board
        </h1>
        <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
          Important university announcements, sorted by priority.
        </p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Filter notices by category"
          className="flex min-w-max gap-2 border-b border-border dark:border-border"
        >
          {CATEGORIES.map(({ value, label }) => {
            const count =
              value === 'all'
                ? notices.length
                : notices.filter((notice) => notice.category === value).length
            const selected = categoryFilter === value

            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategoryFilter(value)}
                className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  selected
                    ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                    : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground'
                }`}
              >
                {label}
                <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <section aria-label="Filter notices by priority">
        <div className="inline-flex max-w-full rounded-xl border border-border bg-muted p-1 dark:border-border dark:bg-card">
          {PRIORITIES.map(({ value, label }) => {
            const selected = priorityFilter === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setPriorityFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 ${
                  selected
                    ? 'bg-card text-foreground shadow-xs dark:bg-muted dark:text-foreground'
                    : 'text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      <p aria-live="polite" className="text-sm text-muted-foreground dark:text-muted-foreground">
        Showing {filteredNotices.length} of {notices.length}{' '}
        {notices.length === 1 ? 'notice' : 'notices'}
      </p>

      {filteredNotices.length > 0 ? (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} now={now} />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center dark:border-border dark:bg-card">
          <CalendarDays
            className="mx-auto h-10 w-10 text-muted-foreground dark:text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-bold">
            {filtersAreActive ? 'No notices match these filters' : 'No notices here yet'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
            {filtersAreActive
              ? 'Try another category or priority to see more notices.'
              : 'New announcements from your university will appear here.'}
          </p>
        </section>
      )}
    </div>
  )
}
