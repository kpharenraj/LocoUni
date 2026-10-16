'use client'

import { useState, useTransition } from 'react'
import AdminBackLink from '@/components/admin/AdminBackLink'
import {
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
} from '@/app/actions/notices'
import type { NoticeCategory, NoticePriority } from '@/lib/validation'
import { useToast } from '@/components/ui/ToastProvider'
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CalendarDays,
  Tag,
  AlertTriangle,
  Info,
} from 'lucide-react'

export interface NoticeItem {
  id: string
  title: string
  body?: string | null
  category: NoticeCategory
  priority: NoticePriority
  event_date?: string | null
  created_at?: string
}

interface NoticesClientViewProps {
  notices: NoticeItem[]
  universityName?: string
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
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
]

function priorityOrder(p: NoticePriority): number {
  if (p === 'urgent') return 0
  if (p === 'high') return 1
  return 2
}

function getPriorityStyles(priority: NoticePriority) {
  if (priority === 'urgent')
    return {
      badge: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/40',
      card: 'border-red-300/70 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20',
      dot: 'bg-red-500',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    }
  if (priority === 'high')
    return {
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40',
      card: 'border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10',
      dot: 'bg-amber-500',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    }
  return {
    badge: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border border-border/60 dark:border-border/60',
    card: 'border-border dark:border-border bg-card dark:bg-card',
    dot: 'bg-muted-foreground',
    icon: <Info className="w-3.5 h-3.5" />,
  }
}

function getCategoryLabel(cat: NoticeCategory): string {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

const LABEL_CLASS =
  'block text-xs font-semibold text-muted-foreground dark:text-muted-foreground mb-1'

const INPUT_CLASS =
  'w-full px-3.5 py-2 text-sm rounded-xl border border-border dark:border-border bg-card dark:bg-background text-foreground dark:text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'

export default function NoticesClientView({
  notices,
  universityName,
}: NoticesClientViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<NoticePriority | 'all'>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeNotice, setActiveNotice] = useState<NoticeItem | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<NoticeItem | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formCategory, setFormCategory] = useState<NoticeCategory>('academic')
  const [formPriority, setFormPriority] = useState<NoticePriority>('normal')
  const [formEventDate, setFormEventDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const openCreateModal = () => {
    setModalMode('create')
    setActiveNotice(null)
    setFormTitle('')
    setFormBody('')
    setFormCategory('academic')
    setFormPriority('normal')
    setFormEventDate('')
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (notice: NoticeItem) => {
    setModalMode('edit')
    setActiveNotice(notice)
    setFormTitle(notice.title)
    setFormBody(notice.body || '')
    setFormCategory(notice.category)
    setFormPriority(notice.priority)
    setFormEventDate(
      notice.event_date
        ? new Date(notice.event_date).toISOString().substring(0, 16)
        : ''
    )
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    if (!formTitle.trim()) {
      setFormError('Notice title is required.')
      return
    }

    const formData = new FormData()
    formData.set('title', formTitle.trim())
    formData.set('body', formBody.trim())
    formData.set('category', formCategory)
    formData.set('priority', formPriority)
    formData.set('event_date', formEventDate)

    startTransition(async () => {
      if (modalMode === 'create') {
        const res = await createNoticeAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to create notice.')
        } else {
          setIsModalOpen(false)
          showToast('Notice posted.')
        }
      } else if (modalMode === 'edit' && activeNotice) {
        formData.set('id', activeNotice.id)
        const res = await updateNoticeAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to update notice.')
        } else {
          setIsModalOpen(false)
          showToast('Notice updated.')
        }
      }
    })
  }

  const handleDelete = () => {
    if (!deleteCandidate) return
    startTransition(async () => {
      const res = await deleteNoticeAction(deleteCandidate.id)
      if (res.success) {
        setDeleteCandidate(null)
        showToast('Notice deleted.')
      } else {
        showToast(res.error || 'Failed to delete notice.', 'error')
      }
    })
  }

  // Sort: priority asc, then newest first
  const sorted = [...notices].sort((a, b) => {
    const pd = priorityOrder(a.priority) - priorityOrder(b.priority)
    if (pd !== 0) return pd
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })

  const filtered = sorted.filter((n) => {
    const catOk = categoryFilter === 'all' || n.category === categoryFilter
    const priOk = priorityFilter === 'all' || n.priority === priorityFilter
    return catOk && priOk
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border dark:border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AdminBackLink />
            <span className="text-muted-foreground dark:text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">Campus Notices</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground dark:text-foreground">
            Campus Notice Board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
            {universityName ? `${universityName} — ` : ''}Post announcements, exam dates, and urgent alerts
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Notice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value as NoticeCategory | 'all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted'
                }`}
              >
                {cat.label}
                {cat.value !== 'all' && (
                  <span className={`ml-1.5 ${categoryFilter === cat.value ? 'text-indigo-200' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                    ({notices.filter((n) => n.category === cat.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter notices by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as NoticePriority | 'all')}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-border dark:border-border bg-card dark:bg-background text-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'notice' : 'notices'}
            </span>
          </div>
        </div>
      </div>

      {/* Notices List */}
      {filtered.length === 0 ? (
        <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border p-12 text-center">
          <Bell className="w-10 h-10 text-muted-foreground dark:text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground dark:text-muted-foreground">
            {notices.length === 0
              ? 'No notices posted yet'
              : 'No notices match your filter'}
          </h3>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 max-w-sm mx-auto">
            {notices.length === 0
              ? 'Post your first campus notice — exam schedules, events, hostel circulars, or urgent alerts.'
              : 'Try a different category or priority filter.'}
          </p>
          {notices.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post First Notice</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice) => {
            const styles = getPriorityStyles(notice.priority)
            return (
              <div
                key={notice.id}
                className={`group rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all ${styles.card}`}
              >
                <div className="flex items-start gap-4">
                  {/* Priority dot */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-foreground dark:text-foreground leading-snug">
                        {notice.title}
                      </h3>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Priority badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles.badge}`}>
                          {styles.icon}
                          {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                        </span>

                        {/* Category badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground">
                          <Tag className="w-3 h-3" />
                          {getCategoryLabel(notice.category)}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    {notice.body && (
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed mb-2 whitespace-pre-line">
                        {notice.body}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground dark:text-muted-foreground">
                      {notice.event_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Event: {formatDate(notice.event_date)}
                        </span>
                      )}
                      {notice.created_at && (
                        <span>Posted {formatDate(notice.created_at)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      aria-label={`Edit notice: ${notice.title}`}
                      onClick={() => openEditModal(notice)}
                      className="p-1.5 rounded-lg border border-border dark:border-border text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Edit notice"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete notice: ${notice.title}`}
                      onClick={() => setDeleteCandidate(notice)}
                      className="p-1.5 rounded-lg border border-border dark:border-border text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl shrink-0 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl dark:border-border dark:bg-card sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-border dark:border-border mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-foreground dark:text-foreground">
                  {modalMode === 'create' ? 'Post New Notice' : 'Edit Notice'}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close notice dialog"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className={LABEL_CLASS}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  aria-label="Notice title"
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam Schedule Released"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={INPUT_CLASS}
                  maxLength={200}
                />
              </div>

              {/* Body */}
              <div>
                <label className={LABEL_CLASS}>Body / Description</label>
                <textarea
                  aria-label="Notice body"
                  rows={4}
                  placeholder="Provide additional details, instructions, or links..."
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    aria-label="Notice category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NoticeCategory)}
                    className={INPUT_CLASS}
                  >
                    {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    aria-label="Notice priority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as NoticePriority)}
                    className={INPUT_CLASS}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Event Date */}
              <div>
                <label className={LABEL_CLASS}>
                  Event Date / Time (Optional)
                </label>
                <input
                  aria-label="Notice event date and time"
                  type="datetime-local"
                  value={formEventDate}
                  onChange={(e) => setFormEventDate(e.target.value)}
                  className={INPUT_CLASS}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  For exam dates, event deadlines, etc.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border dark:border-border text-xs font-semibold text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Post Notice' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md shrink-0 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl dark:border-border dark:bg-card sm:p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-foreground dark:text-foreground">
                Delete Notice?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground mb-5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-foreground dark:text-foreground">
                &ldquo;{deleteCandidate.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-border dark:border-border text-xs font-semibold text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
