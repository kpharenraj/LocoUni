import type { FunctionDeclaration } from '@google/genai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { noticeCategoryEnum, noticePriorityEnum } from '@/lib/validation'

const searchFacultyInput = z.object({
  query: z.string().trim().min(1).max(200),
})

const getLocationInput = z.object({
  query: z.string().trim().min(1).max(200),
})

const getNoticesInput = z.object({
  category: noticeCategoryEnum.optional(),
  priority: noticePriorityEnum.optional(),
})

type ToolResult = Record<string, unknown>
type AssistantTool = {
  declaration: FunctionDeclaration
  execute: (args: unknown, universityId: string) => Promise<ToolResult>
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

function getPriorityRank(priority: string): number {
  switch (priority) {
    case 'urgent':
      return 0
    case 'high':
      return 1
    case 'normal':
      return 2
    default:
      return 3
  }
}

async function searchFaculty(args: unknown, universityId: string): Promise<ToolResult> {
  const input = searchFacultyInput.safeParse(args)
  if (!input.success) return { error: 'A valid faculty search query is required.' }

  try {
    const supabase = await createClient()
    const pattern = `%${escapeLikePattern(input.data.query)}%`
    const fields = ['name', 'role', 'department', 'cabin_number'] as const
    const results = await Promise.all(
      fields.map((field) =>
        supabase
          .from('faculty')
          .select('id, name, role, department, cabin_number, email, location_id')
          .eq('university_id', universityId)
          .ilike(field, pattern)
          .limit(5)
      )
    )

    const failedQuery = results.find((result) => result.error)
    if (failedQuery?.error) return { error: 'Unable to search faculty right now.' }

    const facultyById = new Map<
      string,
      NonNullable<(typeof results)[number]['data']>[number]
    >()
    for (const result of results) {
      for (const member of result.data ?? []) facultyById.set(member.id, member)
    }
    const faculty = [...facultyById.values()].slice(0, 5)
    const locationIds = [...new Set(faculty.flatMap((member) => member.location_id ? [member.location_id] : []))]
    const { data: locations, error: locationsError } = locationIds.length
      ? await supabase
          .from('locations')
          .select('id, name')
          .eq('university_id', universityId)
          .in('id', locationIds)
      : { data: [], error: null }

    if (locationsError) return { error: 'Unable to search faculty right now.' }

    const locationsById = new Map((locations ?? []).map((location) => [location.id, location]))
    return {
      results: faculty.map((member) => {
        const location = member.location_id ? locationsById.get(member.location_id) : null
        return {
          name: member.name,
          role: member.role,
          department: member.department,
          cabin_number: member.cabin_number,
          email: member.email,
          location_name: location?.name ?? null,
          location_id: location?.id ?? null,
        }
      }),
    }
  } catch {
    return { error: 'Unable to search faculty right now.' }
  }
}

async function getLocation(args: unknown, universityId: string): Promise<ToolResult> {
  const input = getLocationInput.safeParse(args)
  if (!input.success) return { error: 'A valid location search query is required.' }

  try {
    const supabase = await createClient()
    const pattern = `%${escapeLikePattern(input.data.query)}%`
    const fields = ['name', 'type', 'description'] as const
    const results = await Promise.all(
      fields.map((field) =>
        supabase
          .from('locations')
          .select('id, name, type, description')
          .eq('university_id', universityId)
          .ilike(field, pattern)
          .limit(5)
      )
    )

    const failedQuery = results.find((result) => result.error)
    if (failedQuery?.error) return { error: 'Unable to search campus locations right now.' }

    const locationsById = new Map<
      string,
      NonNullable<(typeof results)[number]['data']>[number]
    >()
    for (const result of results) {
      for (const location of result.data ?? []) locationsById.set(location.id, location)
    }
    const locations = [...locationsById.values()].slice(0, 5)
    const locationIds = locations.map((location) => location.id)
    const { data: faculty, error: facultyError } = locationIds.length
      ? await supabase
          .from('faculty')
          .select('name, cabin_number, location_id')
          .eq('university_id', universityId)
          .in('location_id', locationIds)
      : { data: [], error: null }

    if (facultyError) return { error: 'Unable to search campus locations right now.' }

    return {
      results: locations.map((location) => ({
        id: location.id,
        name: location.name,
        type: location.type,
        description: location.description,
        faculty: (faculty ?? [])
          .filter((member) => member.location_id === location.id)
          .map((member) => ({ name: member.name, cabin_number: member.cabin_number })),
      })),
    }
  } catch {
    return { error: 'Unable to search campus locations right now.' }
  }
}

async function getNotices(args: unknown, universityId: string): Promise<ToolResult> {
  const input = getNoticesInput.safeParse(args)
  if (!input.success) return { error: 'The requested notice category or priority is invalid.' }

  try {
    const supabase = await createClient()
    const priorities = input.data.priority
      ? [input.data.priority]
      : ['urgent', 'high', 'normal'] as const

    const results = await Promise.all(
      priorities.map((priority) => {
        let query = supabase
          .from('notices')
          .select('title, body, category, priority, event_date, created_at')
          .eq('university_id', universityId)
          .eq('priority', priority)
          .order('created_at', { ascending: false })
          .limit(8)

        if (input.data.category) query = query.eq('category', input.data.category)
        return query
      })
    )

    if (results.some((result) => result.error)) {
      return { error: 'Unable to retrieve notices right now.' }
    }

    const notices = results.flatMap((result) => result.data ?? [])
    notices.sort(
      (a, b) =>
        getPriorityRank(a.priority) - getPriorityRank(b.priority) ||
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )

    return {
      results: notices.slice(0, 8).map((notice) => ({
        title: notice.title,
        body: notice.body?.slice(0, 300) ?? null,
        category: notice.category,
        priority: notice.priority,
        event_date: notice.event_date,
        created_at: notice.created_at,
      })),
    }
  } catch {
    return { error: 'Unable to retrieve notices right now.' }
  }
}

export const assistantTools: AssistantTool[] = [
  {
    declaration: {
      name: 'search_faculty',
      description: 'Search faculty and staff by name, role, department, or cabin number.',
      parametersJsonSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'The faculty search text.' } },
        required: ['query'],
        additionalProperties: false,
      },
    },
    execute: searchFaculty,
  },
  {
    declaration: {
      name: 'get_location',
      description: 'Find campus locations by name, type, or description.',
      parametersJsonSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'The location search text.' } },
        required: ['query'],
        additionalProperties: false,
      },
    },
    execute: getLocation,
  },
  {
    declaration: {
      name: 'get_notices',
      description: 'Get recent campus notices, optionally filtered by category and priority.',
      parametersJsonSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['academic', 'exams', 'placements', 'emergency', 'events', 'hostel'],
          },
          priority: { type: 'string', enum: ['urgent', 'high', 'normal'] },
        },
        additionalProperties: false,
      },
    },
    execute: getNotices,
  },
]

export async function executeAssistantTool(
  name: string,
  args: unknown,
  universityId: string
): Promise<ToolResult> {
  const tool = assistantTools.find((candidate) => candidate.declaration.name === name)
  if (!tool) return { error: 'Unknown assistant tool.' }
  return tool.execute(args, universityId)
}
