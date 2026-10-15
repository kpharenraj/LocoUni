import { Bot } from 'lucide-react'
import StudentPlaceholder from '@/components/student/StudentPlaceholder'

interface StudentRouteProps {
  params: Promise<{ universityId: string }>
}

export default async function AssistantPage({ params }: StudentRouteProps) {
  const { universityId } = await params

  return (
    <StudentPlaceholder
      title="Campus assistant"
      description="Ask questions about faculty, campus locations, and university notices."
      icon={<Bot className="h-7 w-7" />}
      homeHref={`/u/${universityId}`}
    />
  )
}