import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithProfile } from '@/lib/auth'
import JoinUniversityClient from '@/components/join/JoinUniversityClient'

interface JoinUniversityPageProps {
  params: Promise<{ universityId: string }>
}

export const dynamic = 'force-dynamic'

export default async function JoinUniversityPage({ params }: JoinUniversityPageProps) {
  const { universityId } = await params

  const supabase = await createClient()

  // Fetch university — must be approved
  const { data: university } = await supabase
    .from('universities')
    .select('id, name, city, country, logo_url, description, website, status')
    .eq('id', universityId)
    .eq('status', 'approved')
    .maybeSingle()

  if (!university) {
    notFound()
  }

  // Check current user
  const userWithProfile = await getCurrentUserWithProfile()

  return (
    <JoinUniversityClient
      university={university}
      currentUser={
        userWithProfile
          ? {
              role: userWithProfile.profile?.role ?? null,
              universityId: userWithProfile.profile?.university_id ?? null,
            }
          : null
      }
    />
  )
}
