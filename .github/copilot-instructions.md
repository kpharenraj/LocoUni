# LocoUni project rules
- Stack: Next.js (App Router, TypeScript), Tailwind, shadcn/ui, Supabase, Leaflet.
- Specs are in docs/PRD.md, docs/ARCHITECTURE.md, docs/DATABASE.md.
- Server Actions must validate with Zod, call requireAdmin() for admin features,
  and always take university_id from the user's profile on the server, never
  from form data.
- Use the service-role client (lib/supabase/admin.ts) only in server code for
  creating users/profiles. Use the normal server client for reads so RLS applies.
- Leaflet components must be client-only (next/dynamic, ssr: false).
- Mobile-first UI. Run npm run build after changes and fix errors.
- Do not touch .env.local or print secret keys.