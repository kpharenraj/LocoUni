import 'server-only'
import type { Metadata } from 'next'

export const site = {
  name: 'LocoUni',
  tagline: 'Your campus guide for new students',
  description:
    'LocoUni helps new students find faculty, campus locations, notices and AI-powered answers in one university guide.',
  organization: 'HDevs Labs',
  organizationDescription: 'an independent software studio',
  ownerName: 'KP Haren Raj',
  ownerRole: 'Founder',
  contactEmail: 'koyalkarpulkalharenraj@gmail.com',
  url:
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  social: {
    github: 'https://github.com/kpharenraj',
    instagram: 'https://www.instagram.com/kpharenraj/',
    facebook: 'https://www.facebook.com/profile.php?id=61591957987568',
    x: 'https://x.com/KPHarenRaj',
    linkedin: 'https://www.linkedin.com/in/k-p-haren-raj/',
    threads: 'https://www.threads.com/@kpharenraj',
    portfolio: 'https://kpharenraj.github.io/HAREN_RAJ_PORTFOLIO/',
  },
} as const

export const siteLastUpdated = 'October 17, 2026'

export function siteUrl(path = ''): string {
  return new URL(path, `${site.url}/`).toString()
}

export function createPageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      url: siteUrl(path),
      title: `${title} | ${site.name}`,
      description,
    },
  }
}
