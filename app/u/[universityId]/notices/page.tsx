import { Bell } from 'lucide-react'
import StudentPlaceholder from '@/components/student/StudentPlaceholder'

interface StudentRouteProps {
  params: Promise<{ universityId: string }>
}

export default async function NoticesPage({ params }: StudentRouteProps) {
  const { universityId } = await params

  return (
    <StudentPlaceholder
      title="Notice board"
      description="Stay up to date with academic, events, examination, and emergency notices."
      icon={<Bell className="h-7 w-7" />}
      homeHref={`/u/${universityId}`}
    />
  )
}