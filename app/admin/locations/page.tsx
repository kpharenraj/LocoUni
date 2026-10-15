import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import LocationsClientView, {
  type LocationItem,
} from '@/components/locations/LocationsClientView'

export const dynamic = 'force-dynamic'

export default async function AdminLocationsPage() {
  const { universityId } = await requireAdmin()
  const supabase = await createClient()

  // Fetch university details for map center
  const { data: university } = await supabase
    .from('universities')
    .select('name, lat, lng')
    .eq('id', universityId)
    .maybeSingle()

  // Fetch existing locations for this university
  const { data: locationsData } = await supabase
    .from('locations')
    .select('id, name, type, description, lat, lng, created_at')
    .eq('university_id', universityId)
    .order('created_at', { ascending: false })

  const locations: LocationItem[] = locationsData || []
  const universityCenter =
    university?.lat && university?.lng
      ? { lat: university.lat, lng: university.lng }
      : null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <LocationsClientView
          locations={locations}
          universityCenter={universityCenter}
          universityName={university?.name}
        />
      </div>
    </div>
  )
}
