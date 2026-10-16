import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'
import { siteUrl, siteLastUpdated } from '@/lib/site'

export const revalidate = 3600

const staticPages: Array<{
  path: string
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
}> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/join', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/add-university', priority: 0.7, changeFrequency: 'monthly' },
]

const lastModified = new Date(siteLastUpdated)

function getStaticEntries(): MetadataRoute.Sitemap {
  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !anonKey) return getStaticEntries()

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
    const { data: universities, error } = await supabase
      .from('universities')
      .select('id, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Failed to query approved universities for sitemap:', error.message)
      return getStaticEntries()
    }

    return [
      ...getStaticEntries(),
      ...(universities ?? []).map((university) => ({
        url: siteUrl(`/join/${university.id}`),
        lastModified: university.created_at
          ? new Date(university.created_at)
          : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch (error) {
    console.error('Failed to generate university sitemap entries:', error)
    return getStaticEntries()
  }
}
