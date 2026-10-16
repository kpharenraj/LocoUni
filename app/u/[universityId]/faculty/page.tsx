import StudentFacultyDirectory, {
  type StudentFacultyMember,
} from '@/components/student/StudentFacultyDirectory'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface StudentRouteProps {
  params: Promise<{ universityId: string }>
}

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Faculty Directory' }

export default async function FacultyPage({ params }: StudentRouteProps) {
  const { universityId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faculty')
    .select(
      'id, name, role, department, cabin_number, photo_url, email, phone, locations(id, name, lat, lng)'
    )
    .eq('university_id', universityId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to load faculty directory: ${error.message}`)
  }

  const faculty: StudentFacultyMember[] = (data ?? []).map((member) => {
    const location = Array.isArray(member.locations)
      ? member.locations[0]
      : member.locations

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      cabin_number: member.cabin_number,
      photo_url: member.photo_url,
      email: member.email,
      phone: member.phone,
      locations: location
        ? {
            id: location.id,
            name: location.name,
            lat: location.lat,
            lng: location.lng,
          }
        : null,
    }
  })

  return <StudentFacultyDirectory universityId={universityId} faculty={faculty} />
}