import 'server-only'

export const site = {
  name: 'LocoUni',
  tagline: 'Your campus guide for new students',
  description:
    'LocoUni helps new students find faculty, campus locations, notices and answers about their university, with a map, a faculty directory, a notice board and an AI assistant.',
  organization: 'HDevs Labs',
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
    linkedin: 'https://www.linkedin.com/in/k-p-haren-raj/',
  },
} as const

export const siteLastUpdated = 'October 16, 2026'
