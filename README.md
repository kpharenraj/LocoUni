# LocoUni

A campus guide for new students. Universities add their campus map, faculty, and notices. Students join their university and use an AI assistant, faculty directory, campus map, and notice board to find their way around.

## Status
MVP in development (3-day build). Web first, mobile app later.

## Tech stack
- **Web:** Next.js (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage) + Next.js API routes / Server Actions
- **AI:** Claude API (Anthropic) with tool calling
- **Maps:** Leaflet + OpenStreetMap
- **Hosting:** Vercel + Supabase cloud
- **Mobile (later):** React Native + Expo

## Documentation
| File | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements, scope, user flows |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, folder structure, AI flow |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, security policies |
| [docs/SETUP.md](docs/SETUP.md) | Prerequisites and local setup |
| [docs/PLAN.md](docs/PLAN.md) | 3-day build plan and task checklist |

## Quick start
```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```
Open http://localhost:3000. Full details in [docs/SETUP.md](docs/SETUP.md).
