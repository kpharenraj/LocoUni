import StudentCampusMap from '@/components/student/StudentCampusMap'
import type { MapLocation } from '@/components/map/CampusMap'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface StudentMapPageProps {
  params: Promise<{ universityId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Campus Map' }

export default async function CampusMapPage({
  params,
  searchParams,
}: StudentMapPageProps) {
  const [{ universityId }, query] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const { data: rows, error: locationsError } = await supabase
    .from('locations')
    .select('id, name, type, description, lat, lng, photo_url')
    .eq('university_id', universityId)
    .order('name', { ascending: true })

  if (locationsError) {
    throw new Error(`Failed to load campus locations: ${locationsError.message}`)
  }

  const locationRows = rows ?? []
  const locationIds = locationRows.map((location) => location.id)
  const facultyByLocation: Record<
    string,
    { id: string; name: string; cabin_number: string | null }[]
  > = {}

  if (locationIds.length > 0) {
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, cabin_number, location_id')
      .eq('university_id', universityId)
      .in('location_id', locationIds)
      .order('name', { ascending: true })

    if (facultyError) {
      throw new Error(`Failed to load faculty locations: ${facultyError.message}`)
    }

    for (const member of faculty ?? []) {
      if (!member.location_id) continue
      facultyByLocation[member.location_id] ??= []
      facultyByLocation[member.location_id].push({
        id: member.id,
        name: member.name,
        cabin_number: member.cabin_number,
      })
    }
  }

  const locations: MapLocation[] = locationRows.map((location) => ({
    id: location.id,
    name: location.name,
    type: location.type || 'other',
    description: location.description,
    photo_url: location.photo_url,
    lat: location.lat,
    lng: location.lng,
    faculty: facultyByLocation[location.id] ?? [],
  }))
  const initialFocusId =
    typeof query.focus === 'string' ? query.focus : undefined

  return (
    <StudentCampusMap
      locations={locations}
      initialFocusId={initialFocusId}
    />
  )
}
