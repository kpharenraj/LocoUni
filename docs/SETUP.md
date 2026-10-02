# LocoUni: Setup Checklist

Do all of this **before Day 1** so no build time is lost.

## 1. Software on your laptop
- [ ] **Node.js** 20 LTS or newer (`node -v`). Download from nodejs.org
- [ ] **Git** (`git --version`)
- [ ] **VS Code** (or any editor), with extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- [ ] A modern browser with dev tools (Chrome or Edge)

## 2. Accounts to create
| Account | Used for | Cost |
|---|---|---|
| **GitHub** | Code (repo `LocoUni` already created) | Free |
| **Supabase** (supabase.com) | Database, auth, storage | Free tier |
| **Anthropic Console** (console.anthropic.com) | Claude API key | Pay as you go |
| **Vercel** (vercel.com) | Hosting, sign in with GitHub | Free tier |

Notes:
- The **Anthropic API is billed separately** from a Claude.ai subscription. Add a small amount of credit (a few dollars is enough for development) and set a monthly spend limit.
- Sign in to Vercel with your GitHub account so deploys are one click.

## 3. Supabase project setup
1. Create a new project (name: `locouni`, pick the region closest to your users, save the database password).
2. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (secret, never share or commit)
3. Open **SQL Editor** and run the SQL from `docs/DATABASE.md`.
4. Create the Storage buckets `faculty-photos` and `logos` (public).
5. **Authentication → Providers:** keep Email enabled. For fast development, turn **off** "Confirm email" (turn it back on before real launch).
6. **Authentication → URL Configuration:** set Site URL to `http://localhost:3000` for now. Add your Vercel URL later.

## 4. Anthropic API key
1. Console → **API Keys** → create a key named `locouni-dev`.
2. Copy it once and store it in `.env.local`.

## 5. Project setup (inside your cloned `LocoUni` folder)

```bash
# Create Next.js app in the current folder
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"

# Dependencies
npm install @supabase/supabase-js @supabase/ssr zod leaflet react-leaflet @anthropic-ai/sdk
npm install -D @types/leaflet

# UI components
npx shadcn@latest init
npx shadcn@latest add button input card tabs badge select textarea dialog label
```

If `create-next-app` complains the folder is not empty, move the `docs` folder and `README.md` out temporarily, run it, then move them back.

## 6. Environment variables

Create `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Create `.env.example` with the same names and empty values, and commit **that** one.

Confirm `.gitignore` contains `.env*.local`. Next.js adds it by default.

## 7. Git workflow
```bash
git checkout -b dev
# work, then:
git add .
git commit -m "feat: landing page"
git push origin dev
```
- Commit small and often.
- Push at the end of each day so nothing is lost.
- Merge `dev` into `main` when something works; Vercel deploys `main`.

## 8. Vercel (set up on Day 1 evening, not Day 3)
1. Import the `LocoUni` GitHub repo into Vercel.
2. Add the same environment variables in Project Settings → Environment Variables.
3. Deploy early so deployment problems show up on Day 1, not on the last day.
4. Add the Vercel URL to Supabase → Authentication → URL Configuration.

## 9. Demo data to prepare (collect now)
Gather real information for one university (yours or a friend's):
- [ ] Campus center coordinates (right-click on Google Maps → copy lat/lng)
- [ ] 5 to 8 locations with coordinates (library, canteen, main block, hostel, gate...)
- [ ] 8 to 10 faculty with name, role, department, cabin, and photo
- [ ] 10 sample notices across all categories and priorities

## 10. Final pre-flight check
- [ ] `node -v` shows 20 or higher
- [ ] Repo cloned and opens in VS Code
- [ ] Supabase project created and SQL executed
- [ ] Both Storage buckets exist
- [ ] Anthropic key works and credit is added
- [ ] `.env.local` filled in
- [ ] `npm run dev` shows the Next.js starter at localhost:3000
- [ ] Demo data collected
