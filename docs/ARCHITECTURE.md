# LocoUni: Architecture

## Overview
LocoUni is a Next.js App Router application using TypeScript, React, Tailwind CSS, Supabase, Leaflet, and the Google Gemini API. Server Components and Server Actions use the normal Supabase server client; browser university search uses the browser client. Auth-user/profile creation and storage uploads use a server-only service-role client.

```text
Browser
  └── Next.js App Router
      ├── Server Components and Server Actions
      ├── /api/chat (Gemini assistant)
      ├── Supabase browser/server clients (RLS applies)
      └── Supabase service-role client (server only; bypasses RLS)
```

## Main repository structure
```text
app/
  actions/                 Auth, university, join, location, faculty, notice actions
  admin/                   Admin dashboard, locations, faculty, notices, settings
  api/chat/route.ts        Campus assistant endpoint
  join/                    Approved-university search and join pages
  u/[universityId]/        Student home, assistant, faculty, map, and notices
  about/ contact/ faq/ how-it-works/ privacy/ terms/
components/
  admin/ faculty/ join/ locations/ map/ notices/ providers/ site/ student/ ui/
lib/
  ai/                      Gemini client, context builder, and system prompt
  supabase/                Browser, server, and service-role clients
  auth.ts                  Server-side profile lookup and admin guard
  validation.ts            Zod schemas
proxy.ts                   Supabase auth-session refresh and logged-out redirects
docs/                      Product, architecture, database, setup, and plan docs
```

## Authentication and authorization
- `proxy.ts` refreshes the Supabase auth session and redirects logged-out requests for `/admin` and `/u/*` to `/login`. It does not establish the user's role.
- Admin pages/actions use `requireAdmin()` and get `university_id` from the authenticated user's profile. Server Actions validate submitted fields with Zod.
- The student layout checks the signed-in user's profile and redirects if the requested university does not match that profile.
- Student signup and admin university registration create auth users and profiles with the service-role client. The normal server client is used for application reads and tenant-scoped content writes, so RLS remains in force.
- The service-role key must remain server-only and must never be exposed through a `NEXT_PUBLIC_` variable.

## Database and tenant model
The expected Supabase schema and policies are documented in [DATABASE.md](./DATABASE.md). Content rows have a `university_id`; application queries filter on it, and admin writes are scoped to the admin's profile university. The documented content-table read policies are public, however, so this is application-level scoping rather than confidential tenant isolation at the database layer.

## Campus assistant request flow
```text
Student sends conversation to POST /api/chat
  → validate message payload
  → authenticate user and load their profile
  → require a student profile with university_id
  → check in-process reply cache for a single-message request
  → load university name and enforce the per-user hourly limit
  → build campus context from that university's locations, faculty, and recent notices
  → send context, system instruction, and conversation to Gemini
  → return the generated reply
```

The university ID comes from the authenticated profile, not from the request body. Campus context is assembled by `lib/ai/context.ts`; the implementation does not declare or execute Gemini function tools. The default hourly limit is 10 (`CHAT_HOURLY_LIMIT` overrides it). Rate-limit records are stored in the shared `chat_usage` table; the count and insert are separate, so simultaneous requests can race. Single-message answers are cached in process memory for 10 minutes, making the cache instance-local.

## Maps and image storage
- Leaflet map and pin-picker components are loaded client-side with `next/dynamic` and `ssr: false`.
- Supabase Storage uses public buckets named `faculty-photos`, `logos`, and `location-photos`.
- Server Actions validate image inputs and use the service-role client for uploads; the resulting public URLs are saved to the relevant database rows.

## Configuration
Environment variables are listed in [SETUP.md](./SETUP.md) and `.env.example`. The Gemini key/model, Supabase service-role key, site URL, and Google site-verification token are server-side values; only the Supabase URL and anon key are public configuration.
