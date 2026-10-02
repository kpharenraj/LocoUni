# LocoUni: 3-Day Build Plan

Rule: if a task is not on this list, it waits until after launch.

## Day 0 (before starting): Setup
- [ ] Complete everything in `docs/SETUP.md`
- [ ] Commit docs to the repo

## Day 1: Foundation + Admin side
**Morning**
- [ ] Next.js project, Tailwind, shadcn/ui running
- [ ] Supabase clients (`lib/supabase/client.ts`, `server.ts`, `admin.ts`)
- [ ] `middleware.ts` for session handling
- [ ] Landing page with "Add University" and "Join University"
- [ ] Login page and logout

**Afternoon**
- [ ] Add University form + Server Action (creates auth user, university, admin profile)
- [ ] Admin dashboard layout with navigation
- [ ] Admin Locations: list, add with map pin picker, edit, delete

**Evening**
- [ ] Admin Faculty: list, add with photo upload, edit, delete
- [ ] Deploy to Vercel (catch deploy issues early)
- [ ] Push to GitHub

## Day 2: Student side
**Morning**
- [ ] Admin Notices: list, add, edit, delete
- [ ] Join page: university search (approved only) and select
- [ ] Student signup/login and save `university_id`
- [ ] Student layout with navigation (`/u/[universityId]/...`)

**Afternoon**
- [ ] Home page (info + urgent notices + quick links)
- [ ] Faculty directory with search and department filter
- [ ] Campus map with pins, type filter, search, and `?focus=` support

**Evening**
- [ ] Notice board: category tabs + priority filter + urgent highlighting
- [ ] Load demo data
- [ ] Push to GitHub

## Day 3: AI + Polish + Launch
**Morning**
- [ ] `lib/ai/tools.ts`: `search_faculty`, `get_location`, `get_notices`
- [ ] `/api/chat` route with auth, university scoping, tool loop, rate limit
- [ ] Assistant chat page UI (messages, loading state, suggested questions)
- [ ] Test with 20 sample questions

**Afternoon**
- [ ] Mobile responsiveness pass on every page
- [ ] Empty states, loading states, error messages
- [ ] Form validation messages

**Evening**
- [ ] Switch Supabase email confirmation on (if time permits)
- [ ] Final deploy, test full admin and student flow on a phone
- [ ] Update README with live URL and screenshots

## Fallbacks if you run behind
| If short on time | Cut |
|---|---|
| Behind by half a day | Edit/delete screens (keep add + list) |
| Behind by a full day | Priority filter and map type filter |
| Still behind | Map search box, department filter |
| Never cut | Add University, Join, Faculty, Map, Notices, AI |

## Test script (end of Day 3)
1. Create a new university as admin, approve it in Supabase.
2. Add 2 locations, 2 faculty, 3 notices.
3. In a private window, sign up as a student, search the university, and join.
4. Check all four student pages.
5. Ask the AI: "Where is the library?", "Where can I find [faculty name]?", "Any urgent notices?", and one question it cannot answer.
6. Confirm a student from a second university cannot see the first one's data in the AI.

## After MVP
Expo mobile app, push notifications, Google login, approval dashboard, semantic search, multi-language, analytics.
