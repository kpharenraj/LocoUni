# LocoUni: Implementation Status and Follow-up

The repository contains an implemented web MVP. This document replaces the original day-by-day build checklist, which no longer represented the project state. Status here reflects code present in the repository, not deployment or production verification.

## Implemented in the repository
- [x] Next.js App Router application with TypeScript and Tailwind CSS.
- [x] Supabase browser, server, and service-role clients.
- [x] Email/password login and logout; logged-out redirects for admin and student routes.
- [x] University registration, pending status, admin profile creation, and university settings.
- [x] Admin management for campus locations, faculty, and notices.
- [x] Student search and join flow for approved universities.
- [x] Student home, campus assistant, faculty directory, campus map, and notice board.
- [x] Gemini-backed assistant with university-scoped context, per-user hourly usage records, and in-process reply cache.
- [x] Responsive public pages, metadata/SEO routes, and legal/information pages.
- [x] Client-only Leaflet map and pin-picker loading.

## Supabase setup that still requires an operator
1. Create a Supabase project and configure the variables in `.env.local` from `.env.example`.
2. Apply the schema and policies in [DATABASE.md](./DATABASE.md), if they have not already been applied.
3. Create the public Storage buckets `faculty-photos`, `logos`, and `location-photos`.
4. Approve each university by setting its `universities.status` to `approved` in Supabase. There is no approval UI in the application.
5. Configure `GEMINI_API_KEY` and `GEMINI_MODEL` to enable chat.
6. Add real campus records through the admin UI or an approved database workflow.

## Known boundaries / follow-up candidates
- The documented content read policies are public; they do not enforce confidential university isolation.
- University approval is manual.
- Assistant request caching and rate-limit enforcement are in process memory and are not shared across instances.
- There is no checked-in database migration history or generated database type definition; keep the SQL in [DATABASE.md](./DATABASE.md) aligned with the application's Supabase queries.
- Build and lint scripts are available through `npm run build` and `npm run lint`. This document does not claim that a deployment or end-to-end acceptance run has been performed.

## Potential future work
- Add a controlled approval workflow.
- Define private-vs-public data requirements and enforce them with RLS before storing non-public information.
- Move rate limiting and response caching to shared storage for multi-instance deployments.
- Add automated integration/acceptance coverage and measurable assistant-quality evaluation.
- Consider mobile apps, notifications, semantic search, and localization if product needs warrant them.
