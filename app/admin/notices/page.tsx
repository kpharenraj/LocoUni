import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import NoticesClientView, {
  type NoticeItem,
} from '@/components/notices/NoticesClientView'
import type { NoticeCategory, NoticePriority } from '@/lib/validation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Manage Notices' }

export default async function AdminNoticesPage() {
  const { universityId } = await requireAdmin()
  const supabase = await createClient()

  // Fetch university name
  const { data: university } = await supabase
    .from('universities')
    .select('name')
    .eq('id', universityId)
    .maybeSingle()

  // Fetch all notices for this university, newest first (client will re-sort by priority)
  const { data: noticesData } = await supabase
    .from('notices')
    .select('id, title, body, category, priority, event_date, created_at')
    .eq('university_id', universityId)
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notices: NoticeItem[] = (noticesData || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    category: n.category as NoticeCategory,
    priority: n.priority as NoticePriority,
    event_date: n.event_date,
    created_at: n.created_at,
  }))

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <NoticesClientView
          notices={notices}
          universityName={university?.name}
        />
      </div>
    </div>
  )
}
