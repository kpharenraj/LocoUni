# LocoUni: Setup

These steps configure the existing repository. Do not scaffold a new Next.js app or reinstall the dependencies listed in `package.json`.

## 1. Prerequisites
- **Node.js 20.9.0 or newer** (required by the installed Next.js version).
- **npm** and **Git**.
- A Supabase project.
- A Google Gemini API key/model if you want to use the campus assistant.

## 2. Install and configure the app
From the repository root:

```bash
npm ci
```

Copy `.env.example` to `.env.local` and fill in the values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-enabled-gemini-model
CHAT_HOURLY_LIMIT=10

SITE_URL=http://localhost:3000
GOOGLE_SITE_VERIFICATION=
```

Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. `CHAT_HOURLY_LIMIT` is optional; if it is not a positive integer, the application defaults to 10. `SITE_URL` is optional in deployments: the application falls back to the Vercel production URL when available, then `http://localhost:3000`. `GOOGLE_SITE_VERIFICATION` is optional.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Available project scripts are `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`.

## 3. Supabase configuration
1. Create a Supabase project and copy its project URL, anon key, and service-role key into `.env.local`.
2. In **SQL Editor**, apply the schema and row-level security policies in [DATABASE.md](./DATABASE.md).
3. In **Storage**, create these public buckets:
   - `faculty-photos`
   - `logos`
   - `location-photos`
4. Keep email/password authentication enabled. Account creation in the app uses the server-side Auth Admin API with `email_confirm: true`, then signs the user in.
5. Configure the Supabase Auth site URL and redirect URLs for local development (`http://localhost:3000`) and the deployed application origin.

University approval is manual: change the university's `status` to `approved` in Supabase. The app's search and join flow only exposes approved universities.

## 4. Gemini configuration
Create a Gemini API key through Google's AI tooling and set `GEMINI_API_KEY`. Set `GEMINI_MODEL` to a model identifier enabled for that key. Both variables are required for `/api/chat`; the assistant returns a configuration error if either is missing. The selected model and API usage may incur provider costs.

## 5. Optional site/deployment configuration
- Set `SITE_URL` to the canonical public origin in production. It is used for canonical metadata and public SEO URLs.
- Set `GOOGLE_SITE_VERIFICATION` to the token from Google Search Console when verifying site ownership.
- Configure the same required environment variables in the hosting provider's environment settings. Keep the service-role key server-only.
- Set the production URL in Supabase Auth URL configuration.

## 6. Smoke check
1. Run `npm run build`.
2. Run `npm run dev` and open the home page.
3. Register a university/admin, approve the university in Supabase, then search for it from `/join`.
4. Join as a student and check the university home, faculty, map, notices, and assistant pages.

Use non-sensitive test data. Under the current RLS policies in [DATABASE.md](./DATABASE.md), campus content is publicly readable.
