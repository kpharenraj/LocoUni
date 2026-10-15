import { Users } from 'lucide-react'
import StudentPlaceholder from '@/components/student/StudentPlaceholder'

interface StudentRouteProps {
  params: Promise<{ universityId: string }>
}

export default async function FacultyPage({ params }: StudentRouteProps) {
  const { universityId } = await params

  return (
    <StudentPlaceholder
      title="Faculty directory"
      description="Find faculty and staff by name, department, and campus location."
      icon={<Users className="h-7 w-7" />}
      homeHref={`/u/${universityId}`}
    />
  )
}