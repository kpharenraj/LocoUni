import type { Content } from '@google/genai'
import { z } from 'zod'
import { buildCampusContext } from '@/lib/ai/context'
import { buildSystemInstruction } from '@/lib/ai/prompt'
import {
  generateGeminiContent,
  getGeminiErrorDetails,
  isGeminiConfigured,
} from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_BODY_BYTES = 32 * 1024
const DAILY_LIMIT_MESSAGE =
  'The assistant has reached its daily limit. Please try again tomorrow, or use the Faculty, Map and Notices pages.'
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(500),
    })
  ).min(1).max(10)
    .refine((messages) => messages.some((message) => message.role === 'user')),
})

type RequestMetrics = {
  universityId: string
  geminiCalls: 0 | 1
  cache: 'hit' | 'miss'
  diagnosis?: 'model_name' | 'request_format'
}

type CachedReply = {
  reply: string
  expiresAt: number
}

const REPLY_CACHE_TTL = 10 * 60 * 1000
const replyCache = new Map<string, CachedReply>()

function jsonError(message: string, status: number, code?: string): Response {
  return Response.json({ error: message, ...(code ? { code } : {}) }, { status })
}

function getHourlyLimit(): number {
  const configuredLimit = Number(process.env.CHAT_HOURLY_LIMIT)
  return Number.isSafeInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : 10
}

function getReplyCacheKey(universityId: string, message: string): string {
  return JSON.stringify([universityId, message.trim().toLowerCase()])
}

function getCachedReply(key: string): string | undefined {
  const cached = replyCache.get(key)
  if (!cached) return undefined
  if (cached.expiresAt <= Date.now()) {
    replyCache.delete(key)
    return undefined
  }
  return cached.reply
}

function cacheReply(key: string, reply: string): void {
  const now = Date.now()
  for (const [cacheKey, cached] of replyCache) {
    if (cached.expiresAt <= now) replyCache.delete(cacheKey)
  }
  if (replyCache.size >= 5000) {
    const oldestKey = replyCache.keys().next().value
    if (oldestKey) replyCache.delete(oldestKey)
  }
  replyCache.set(key, { reply, expiresAt: now + REPLY_CACHE_TTL })
}

function shouldRetry(status: number | undefined, retryDelaySeconds: number | undefined): boolean {
  return (
    (status === 429 || status === 503) &&
    retryDelaySeconds !== undefined &&
    retryDelaySeconds < 10
  )
}

function getGeminiErrorResponse(
  error: unknown,
  metrics: RequestMetrics
): Response {
  const details = getGeminiErrorDetails(error)

  if (details.status === 429) {
    if (details.perDayQuota || (details.retryDelaySeconds ?? 0) > 60) {
      return jsonError(DAILY_LIMIT_MESSAGE, 429, 'ai_daily_limit')
    }
    return jsonError(
      'The assistant is getting a lot of questions right now. Please try again in a minute.',
      429
    )
  }
  if (details.status === 503) {
    return jsonError('The assistant is temporarily unavailable. Please try again shortly.', 503)
  }
  if (details.status === 404) {
    metrics.diagnosis = 'model_name'
    return jsonError('The assistant could not process your request. Please try again later.', 500)
  }
  if (details.status === 400) {
    metrics.diagnosis = 'request_format'
    return jsonError('The assistant could not process your request. Please try again later.', 500)
  }
  return jsonError('The assistant is temporarily unavailable. Please try again shortly.', 503)
}

async function handleChat(request: Request, metrics: RequestMetrics): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return jsonError('Please log in to use the campus assistant.', 401)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, university_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) return jsonError('Unable to verify your campus account right now.', 500)
  if (profile?.role !== 'student' || !profile.university_id) {
    return jsonError('Only students who have joined a university can use the campus assistant.', 403)
  }
  metrics.universityId = profile.university_id

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) return jsonError('Your message is too large.', 413)

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return jsonError('Unable to read your message. Please try again.', 400)
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonError('Your message is too large.', 413)
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return jsonError('Please send a valid chat request.', 400)
  }
  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Please provide 1 to 10 valid messages, including a user message.', 400)
  }

  const lastUserMessage = [...parsed.data.messages]
    .reverse()
    .find((message) => message.role === 'user')!
  const isCacheable = parsed.data.messages.length === 1
  const cacheKey = isCacheable
    ? getReplyCacheKey(profile.university_id, lastUserMessage.content)
    : undefined

  if (cacheKey) {
    const cachedReply = getCachedReply(cacheKey)
    if (cachedReply) {
      metrics.cache = 'hit'
      return Response.json({ reply: cachedReply })
    }
  }

  if (!isGeminiConfigured()) {
    return jsonError('The AI assistant is not configured on the server.', 500)
  }

  const { data: university, error: universityError } = await supabase
    .from('universities')
    .select('name')
    .eq('id', profile.university_id)
    .maybeSingle()
  if (universityError || !university) {
    return jsonError('Unable to load your campus information right now.', 500)
  }

  const adminClient = createAdminClient()
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await adminClient
    .from('chat_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', hourAgo)
  if (countError) return jsonError('Unable to process your request right now. Please try again.', 500)
  if ((count ?? 0) >= getHourlyLimit()) {
    return jsonError('You have reached the hourly chat limit. Please try again in a little while.', 429)
  }

  const { error: usageError } = await adminClient.from('chat_usage').insert({ user_id: user.id })
  if (usageError) return jsonError('Unable to process your request right now. Please try again.', 500)

  const context = await buildCampusContext(profile.university_id, lastUserMessage.content)
  const systemInstruction = buildSystemInstruction(
    university.name,
    profile.university_id,
    context
  )
  const contents: Content[] = parsed.data.messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  metrics.geminiCalls = 1
  let response: Awaited<ReturnType<typeof generateGeminiContent>>
  try {
    response = await generateGeminiContent(contents, systemInstruction)
  } catch (error) {
    const details = getGeminiErrorDetails(error)
    const isDailyLimit =
      details.status === 429 &&
      (details.perDayQuota || (details.retryDelaySeconds ?? 0) > 60)
    if (!isDailyLimit && shouldRetry(details.status, details.retryDelaySeconds)) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.ceil(details.retryDelaySeconds! * 1000))
      )
      try {
        response = await generateGeminiContent(contents, systemInstruction)
      } catch (retryError) {
        return getGeminiErrorResponse(retryError, metrics)
      }
    } else {
      return getGeminiErrorResponse(error, metrics)
    }
  }

  const reply =
    response.text?.trim() ||
    'I could not find a clear answer. Please check the Faculty, Map or Notices pages.'
  if (cacheKey) cacheReply(cacheKey, reply)
  return Response.json({ reply })
}

export async function POST(request: Request): Promise<Response> {
  const metrics: RequestMetrics = {
    universityId: 'unknown',
    geminiCalls: 0,
    cache: 'miss',
  }
  let status = 500
  try {
    const response = await handleChat(request, metrics)
    status = response.status
    return response
  } catch {
    return jsonError('Unable to process your request right now. Please try again.', 500)
  } finally {
    const errorStatus = status >= 400 ? status : 'none'
    console.info(
      `chat_request universityId=${metrics.universityId} geminiCalls=${metrics.geminiCalls} cache=${metrics.cache} errorStatus=${errorStatus}${
        metrics.diagnosis ? ` diagnosis=${metrics.diagnosis}` : ''
      }`
    )
  }
}
