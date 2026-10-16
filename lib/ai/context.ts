import 'server-only'

import { createClient } from '@/lib/supabase/server'

type CampusLocation = {
  id: string
  name: string
  type: string | null
  description: string | null
}

type CampusFaculty = {
  name: string
  role: string | null
  department: string | null
  cabin_number: string | null
  email: string | null
  location_id: string | null
}

type CampusNotice = {
  title: string
  body: string | null
  category: string
  priority: string
  event_date: string | null
  created_at: string | null
}

type CampusData = {
  locations: CampusLocation[]
  faculty: CampusFaculty[]
  notices: CampusNotice[]
}

type CachedCampusData = {
  expiresAt: number
  data: CampusData
}

const CAMPUS_DATA_CACHE_TTL = 60_000
const campusDataCache = new Map<string, CachedCampusData>()
const stopWords = new Set([
  'about', 'any', 'are', 'can', 'could', 'find', 'for', 'from', 'get', 'have',
  'help', 'how', 'is', 'me', 'of', 'on', 'please', 'show', 'tell', 'the', 'there',
  'this', 'to', 'up', 'what', 'where', 'which', 'who', 'with', 'would',
])

function getWords(text: string): string[] {
  return [...new Set(
    text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(
      (word) => word.length > 1 && !stopWords.has(word)
    ) ?? []
  )]
}

function scoreMatch(values: (string | null)[], words: string[]): number {
  const text = values.filter(Boolean).join(' ').toLowerCase()
  return words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0)
}

function rankForQuestion<T>(
  rows: T[],
  words: string[],
  getValues: (row: T) => (string | null)[]
): T[] {
  return rows
    .map((row, index) => ({ row, index, score: scoreMatch(getValues(row), words) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 30)
    .map(({ row }) => row)
}

async function loadCampusData(universityId: string): Promise<CampusData> {
  const supabase = await createClient()
  const [locationResult, facultyResult, noticeResult] = await Promise.all([
    supabase
      .from('locations')
      .select('id, name, type, description')
      .eq('university_id', universityId),
    supabase
      .from('faculty')
      .select('name, role, department, cabin_number, email, location_id')
      .eq('university_id', universityId),
    supabase
      .from('notices')
      .select('title, body, category, priority, event_date, created_at')
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  if (locationResult.error) throw new Error('Unable to load campus locations.')
  if (facultyResult.error) throw new Error('Unable to load campus faculty.')
  if (noticeResult.error) throw new Error('Unable to load campus notices.')

  return {
    locations: locationResult.data ?? [],
    faculty: facultyResult.data ?? [],
    notices: noticeResult.data ?? [],
  }
}

function escapeCampusValue(value: string | null): string | null {
  return value?.replace(/<\/campus_data/gi, '&lt;/campus_data') ?? null
}

function compactRow(row: Record<string, string | null>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, escapeCampusValue(value)])
    )
  )
}

export async function buildCampusContext(
  universityId: string,
  question: string
): Promise<string> {
  const now = Date.now()
  let cached = campusDataCache.get(universityId)
  if (cached && cached.expiresAt <= now) {
    campusDataCache.delete(universityId)
    cached = undefined
  }

  let data = cached?.data
  if (!data) {
    data = await loadCampusData(universityId)
    campusDataCache.set(universityId, {
      data,
      expiresAt: now + CAMPUS_DATA_CACHE_TTL,
    })
  }

  const words = getWords(question)
  const locations =
    data.locations.length > 50
      ? rankForQuestion(data.locations, words, (location) => [
          location.name,
          location.type,
          location.description,
        ])
      : data.locations
  const faculty =
    data.faculty.length > 100
      ? rankForQuestion(data.faculty, words, (member) => [
          member.name,
          member.role,
          member.department,
          member.cabin_number,
          member.email,
          data.locations.find((location) => location.id === member.location_id)?.name ?? null,
        ])
      : data.faculty
  const locationsById = new Map(data.locations.map((location) => [location.id, location]))

  const locationLines = locations.map((location) =>
    compactRow({
      id: location.id,
      name: location.name,
      type: location.type,
      description: location.description,
    })
  )
  const facultyLines = faculty.map((member) => {
    const location = member.location_id ? locationsById.get(member.location_id) : null
    return compactRow({
      name: member.name,
      role: member.role,
      department: member.department,
      cabin_number: member.cabin_number,
      email: member.email,
      location_name: location?.name ?? null,
      location_id: location?.id ?? null,
    })
  })
  const noticeLines = data.notices.map((notice) =>
    compactRow({
      title: notice.title,
      body: notice.body?.slice(0, 200) ?? null,
      category: notice.category,
      priority: notice.priority,
      event_date: notice.event_date,
      created_at: notice.created_at,
    })
  )

  return [
    '<campus_data>',
    'LOCATIONS:',
    ...locationLines,
    'FACULTY:',
    ...facultyLines,
    'NOTICES:',
    ...noticeLines,
    '</campus_data>',
  ].join('\n')
}
