import StudentNoticeBoard, {
  type StudentNotice,
} from '@/components/student/StudentNoticeBoard'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface StudentNoticesPageProps {
  params: Promise<{ universityId: string }>
}

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campus Notices' }

export default async function StudentNoticesPage({
  params,
}: StudentNoticesPageProps) {
  const { universityId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, body, category, priority, event_date, created_at')
    .eq('university_id', universityId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(`Failed to load university notices: ${error.message}`)
  }

  const notices: StudentNotice[] = (data ?? []).map((notice) => ({
    id: notice.id,
    title: notice.title,
    body: notice.body,
    category: notice.category,
    priority: notice.priority,
    event_date: notice.event_date,
    created_at: notice.created_at,
  }))

  return <StudentNoticeBoard notices={notices} now={new Date().toISOString()} />
}
