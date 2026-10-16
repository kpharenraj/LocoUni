'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, Loader2, RotateCw, Send, Sparkles, Trash2, User } from 'lucide-react'

type ChatRole = 'user' | 'assistant'
type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  retryable?: boolean
}
type ApiMessage = { role: ChatRole; content: string }

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your campus assistant. Ask me about faculty, campus locations, or university notices, and I'll help you find the information.",
}

const SUGGESTED_QUESTIONS = [
  'Where is the library?',
  'Where can I find the HOD of Computer Science?',
  'Any urgent notices?',
  'What events are coming up?',
]

function createMessage(role: ChatRole, content: string, retryable = false): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...(retryable ? { retryable: true } : {}),
  }
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => {
          const className =
            'font-semibold text-indigo-700 underline decoration-indigo-400 underline-offset-2 hover:text-indigo-900 dark:text-indigo-300 dark:decoration-indigo-500 dark:hover:text-indigo-200'

          if (href?.startsWith('/') && !href.startsWith('//')) {
            return (
              <Link href={href} className={className}>
                {children}
              </Link>
            )
          }

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const hasUserMessage = messages.some((message) => message.role === 'user')

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  async function sendMessage(content: string, retry = false) {
    const text = content.trim()
    if (!text || isLoading || text.length > 500) return

    const requestMessages = [...apiMessages, { role: 'user' as const, content: text }].slice(-10)
    if (!retry) {
      setMessages((current) => [...current, createMessage('user', text)])
    } else {
      setMessages((current) => current.filter((message) => !message.retryable))
    }

    setDraft('')
    setIsLoading(true)
    let canRetry = true

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestMessages }),
      })

      if (!response.ok) {
        let errorBody: unknown
        try {
          errorBody = await response.json()
        } catch {
          errorBody = undefined
        }
        if (
          typeof errorBody === 'object' &&
          errorBody !== null &&
          'code' in errorBody &&
          errorBody.code === 'ai_daily_limit'
        ) {
          canRetry = false
        }
        const serverMessage =
          typeof errorBody === 'object' &&
          errorBody !== null &&
          'error' in errorBody &&
          typeof errorBody.error === 'string'
            ? errorBody.error
            : undefined
        const fallbackMessage =
          response.status === 429
            ? "You've reached the hourly limit, please try again later"
            : response.status === 503
              ? 'The assistant is having trouble replying. Please try again.'
              : 'We could not send your message. Please try again.'
        throw new Error(serverMessage ?? fallbackMessage)
      }

      let result: unknown
      try {
        result = await response.json()
      } catch {
        throw new Error('The assistant is having trouble replying. Please try again.')
      }
      if (
        typeof result !== 'object' ||
        result === null ||
        !('reply' in result) ||
        typeof result.reply !== 'string' ||
        !result.reply.trim()
      ) {
        throw new Error('The assistant is having trouble replying. Please try again.')
      }

      const reply = result.reply.trim()
      setApiMessages([...requestMessages, { role: 'assistant', content: reply }])
      setMessages((current) => [...current, createMessage('assistant', reply)])
    } catch (error) {
      const errorMessage =
        error instanceof TypeError
          ? 'We could not connect to the assistant. Please check your connection and try again.'
          : error instanceof Error
            ? error.message
            : 'The assistant is having trouble replying. Please try again.'
      setDraft(text)
      setMessages((current) => [
        ...current.filter((message) => !message.retryable),
        createMessage(
          'assistant',
          errorMessage,
          canRetry && !errorMessage.startsWith("You've reached the hourly limit")
        ),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(draft)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      if (draft.trim() && !isLoading) void sendMessage(draft)
    }
  }

  function clearChat() {
    if (isLoading) return
    setMessages([WELCOME_MESSAGE])
    setApiMessages([])
    setDraft('')
  }

  return (
    <section
      aria-label="Campus assistant chat"
      className="fixed inset-x-0 top-16 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex min-h-0 flex-col overflow-hidden bg-background dark:bg-background md:static md:h-[calc(100dvh-11rem)] md:min-h-[28rem] md:overflow-hidden"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 dark:border-border dark:bg-card sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold sm:text-base">Campus assistant</h1>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Answers from your campus information
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          disabled={!hasUserMessage || isLoading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground sm:text-sm"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear chat
        </button>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-border bg-card text-indigo-700 dark:border-border dark:bg-card dark:text-indigo-300'
                }`}
                aria-hidden="true"
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </span>
              <div
                className={`max-w-[min(85%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'rounded-tr-md bg-indigo-600 text-white'
                    : 'rounded-tl-md border border-border bg-card text-foreground shadow-sm dark:border-border dark:bg-card dark:text-muted-foreground'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
                    <AssistantMarkdown content={message.content} />
                    {message.retryable && (
                      <button
                        type="button"
                        onClick={() => void sendMessage(draft, true)}
                        disabled={isLoading || !draft.trim()}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
                      >
                        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {!hasUserMessage && (
            <div className="ml-10 sm:ml-11">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    disabled={isLoading}
                    className="rounded-full border border-indigo-200 bg-card px-3 py-2 text-left text-xs font-medium text-indigo-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:bg-card dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-start gap-3" role="status" aria-label="Assistant is typing">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-indigo-700 dark:border-border dark:bg-card dark:text-indigo-300">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm dark:border-border dark:bg-card dark:text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Finding campus information…
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border bg-card px-3 pb-3 pt-3 dark:border-border dark:bg-card sm:px-6 sm:pb-4"
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-border dark:bg-background">
            <label htmlFor="assistant-message" className="sr-only">
              Ask the campus assistant
            </label>
            <textarea
              id="assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              rows={1}
              disabled={isLoading}
              placeholder="Ask about faculty, places, or notices…"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60 dark:text-foreground"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Send message"
              className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-muted dark:disabled:bg-muted"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex min-h-5 items-center justify-between gap-3 px-2 pt-1.5">
            <p className="text-[11px] text-muted-foreground">
              Enter to send · Shift+Enter for a new line
            </p>
            {draft.length >= 450 && (
              <p
                className={`text-[11px] tabular-nums ${
                  draft.length >= 500 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                }`}
                aria-live="polite"
              >
                {draft.length}/500
              </p>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}
