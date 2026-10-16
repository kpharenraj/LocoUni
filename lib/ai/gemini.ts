import 'server-only'

import { GoogleGenAI, type Content, type GenerateContentResponse } from '@google/genai'

export type GeminiErrorDetails = {
  status?: number
  perDayQuota: boolean
  retryDelaySeconds?: number
}

function parseRetryDelay(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value
  if (typeof value !== 'string') return undefined

  const match = value.match(/^\s*(\d+(?:\.\d+)?)\s*(ms|s|m)?\s*$/i)
  if (!match) return undefined
  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  if (unit === 'ms') return amount / 1000
  if (unit === 'm') return amount * 60
  return amount
}

function findRetryDelay(value: unknown): number | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const delay = findRetryDelay(item)
      if (delay !== undefined) return delay
    }
    return undefined
  }
  if (typeof value !== 'object' || value === null) return undefined

  for (const [key, child] of Object.entries(value)) {
    if (/retry.?delay/i.test(key)) {
      const delay = parseRetryDelay(child)
      if (delay !== undefined) return delay
    }
    const nestedDelay = findRetryDelay(child)
    if (nestedDelay !== undefined) return nestedDelay
  }
  return undefined
}

export function getGeminiErrorDetails(error: unknown): GeminiErrorDetails {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : undefined
  const message = error instanceof Error ? error.message : String(error)
  let parsedMessage: unknown
  try {
    parsedMessage = JSON.parse(message)
  } catch {
    parsedMessage = undefined
  }
  const retryDelaySeconds =
    findRetryDelay(parsedMessage) ??
    parseRetryDelay(message.match(/retry in\s+([\d.]+\s*(?:ms|s|m)?)/i)?.[1])
  const quotaText = `${message} ${parsedMessage ? JSON.stringify(parsedMessage) : ''}`

  return {
    status,
    perDayQuota: /perday/i.test(quotaText),
    retryDelaySeconds,
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL)
}

export async function generateGeminiContent(
  contents: Content[],
  systemInstruction: string
): Promise<GenerateContentResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL

  if (!apiKey || !model) throw new Error('Gemini configuration is missing.')

  const ai = new GoogleGenAI({ apiKey })
  return ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      maxOutputTokens: 400,
      httpOptions: {
        timeout: 20_000,
        retryOptions: { attempts: 1 },
      },
    },
  })
}
