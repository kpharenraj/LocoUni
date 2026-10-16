import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import FacultyClientView, {
  type FacultyMemberItem,
  type FacultyLocationOption,
} from '@/components/faculty/FacultyClientView'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Manage Faculty' }

export default async function AdminFacultyPage() {
  const { universityId } = await requireAdmin()
  const supabase = await createClient()

  // Fetch university name
  const { data: university } = await supabase
    .from('universities')
    .select('name')
    .eq('id', universityId)
    .maybeSingle()

  // Fetch faculty members with linked location names
  const { data: facultyData } = await supabase
    .from('faculty')
    .select('id, name, role, department, cabin_number, location_id, photo_url, email, phone, created_at, locations(id, name)')
    .eq('university_id', universityId)
    .order('name', { ascending: true })

  // Fetch campus locations for location dropdown
  const { data: locationsData } = await supabase
    .from('locations')
    .select('id, name')
    .eq('university_id', universityId)
    .order('name', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faculty: FacultyMemberItem[] = (facultyData || []).map((f: any) => ({
    ...f,
    locations: Array.isArray(f.locations) ? f.locations[0] : f.locations,
  }))

  const locations: FacultyLocationOption[] = locationsData || []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FacultyClientView
          faculty={faculty}
          locations={locations}
          universityName={university?.name}
        />
      </div>
    </div>
  )
}
