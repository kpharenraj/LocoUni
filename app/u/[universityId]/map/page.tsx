import { Map } from 'lucide-react'
import StudentPlaceholder from '@/components/student/StudentPlaceholder'

interface StudentRouteProps {
  params: Promise<{ universityId: string }>
}

export default async function CampusMapPage({ params }: StudentRouteProps) {
  const { universityId } = await params

  return (
    <StudentPlaceholder
      title="Campus map"
      description="Explore campus buildings, facilities, and other important locations."
      icon={<Map className="h-7 w-7" />}
      homeHref={`/u/${universityId}`}
    />
  )
}