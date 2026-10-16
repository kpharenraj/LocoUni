import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithProfile } from '@/lib/auth'
import JoinUniversityClient from '@/components/join/JoinUniversityClient'
import { site, siteUrl } from '@/lib/site'

interface JoinUniversityPageProps {
  params: Promise<{ universityId: string }>
}

const getApprovedUniversity = cache(async (universityId: string) => {
  const supabase = await createClient()
  const { data: university, error } = await supabase
    .from('universities')
    .select('id, name, city, country, logo_url, description, website, status')
    .eq('id', universityId)
    .eq('status', 'approved')
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load approved university: ${error.message}`)
  }
  return university
})

function getDescription(city: string | null, description: string | null): string {
  const location = city ? `Explore the ${city} campus.` : 'Explore campus locations.'
  const content = description?.trim()
  const fullDescription = [content, location].filter(Boolean).join(' ')
  if (fullDescription.length <= 160) return fullDescription
  return `${fullDescription.slice(0, 157).trimEnd()}...`
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: JoinUniversityPageProps): Promise<Metadata> {
  const { universityId } = await params
  const university = await getApprovedUniversity(universityId)
  if (!university) notFound()

  const title = `${university.name} campus guide`
  const description = getDescription(university.city, university.description)
  const canonical = `/join/${university.id}`
  const logoUrl = university.logo_url
    ? new URL(university.logo_url, site.url).toString()
    : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: site.name,
      url: siteUrl(canonical),
      title,
      description,
      ...(logoUrl ? { images: [logoUrl] } : {}),
    },
  }
}

export default async function JoinUniversityPage({ params }: JoinUniversityPageProps) {
  const { universityId } = await params
  const university = await getApprovedUniversity(universityId)
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
