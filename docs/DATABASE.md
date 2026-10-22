# LocoUni: Supabase Database

This is the schema and policy setup expected by the current application. There is no checked-in migration history or generated database type definition; keep this SQL aligned with the queries and Server Actions in `app/` and `lib/`.

Run the SQL in **Supabase → SQL Editor** for a new project. If the tables or policies already exist, inspect them before applying changes rather than blindly recreating them.

## Tables used by the application
| Table | Purpose |
|---|---|
| `universities` | University details, approval status, creator, and logo URL |
| `profiles` | Auth user name, role, and joined university |
| `locations` | Campus locations, coordinates, and optional photo URL |
| `faculty` | Faculty/staff details and optional linked location/photo |
| `notices` | University notices with category and priority |
| `chat_usage` | Per-user assistant request timestamps used for hourly limits |

## Schema

```sql
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text,
  website text,
  description text,
  logo_url text,
  lat double precision,
  lng double precision,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student'
    check (role in ('student', 'admin')),
  university_id uuid references public.universities(id) on delete set null
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  type text not null
    check (type in ('block', 'canteen', 'library', 'hostel', 'ground', 'gate', 'parking', 'other')),
  description text,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table public.faculty (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  role text,
  department text,
  cabin_number text,
  location_id uuid references public.locations(id) on delete set null,
  photo_url text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  title text not null,
  body text,
  category text not null check (category in
    ('academic', 'exams', 'placements', 'emergency', 'events', 'hostel')),
  priority text not null default 'normal' check (priority in
    ('urgent', 'high', 'normal')),
  event_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.chat_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index universities_status_name_idx on public.universities (status, name);
create index locations_university_idx on public.locations (university_id);
create index faculty_university_idx on public.faculty (university_id);
create index faculty_university_department_idx on public.faculty (university_id, department);
create index notices_university_category_priority_idx
  on public.notices (university_id, category, priority);
create index chat_usage_user_created_idx on public.chat_usage (user_id, created_at);
```

## Row-Level Security

The current app treats campus content as public. The policies below allow public reads from approved universities and all campus content, while limiting content writes to an admin of the row's university. These policies do **not** provide private tenant isolation; do not store private student or university data in these content tables.

```sql
alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.faculty enable row level security;
alter table public.notices enable row level security;
alter table public.chat_usage enable row level security;

create or replace function public.is_admin_of(uni uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and university_id = uni
  );
$$;

-- Approved universities can be searched; creators can see their own pending record.
create policy "read approved or own universities"
  on public.universities for select
  using (status = 'approved' or created_by = (select auth.uid()));

-- Only editable university-detail columns are granted to signed-in clients.
-- Registration/profile creation and approval use the server-side service-role client/operator.
revoke update on public.universities from anon, authenticated;
grant update (name, city, country, website, description, logo_url, lat, lng)
  on public.universities to authenticated;

create policy "admin update own university"
  on public.universities for update
  using (public.is_admin_of(id))
  with check (public.is_admin_of(id));

-- Profile creation/updates use the server-side service-role client.
create policy "read own profile"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "public read locations"
  on public.locations for select using (true);
create policy "admin write locations"
  on public.locations for all
  using (public.is_admin_of(university_id))
  with check (public.is_admin_of(university_id));

create policy "public read faculty"
  on public.faculty for select using (true);
create policy "admin write faculty"
  on public.faculty for all
  using (public.is_admin_of(university_id))
  with check (public.is_admin_of(university_id));

create policy "public read notices"
  on public.notices for select using (true);
create policy "admin write notices"
  on public.notices for all
  using (public.is_admin_of(university_id))
  with check (public.is_admin_of(university_id));

-- No chat_usage policies: only the service-role server client uses this table.
```

University registration and profile creation use the service-role client. The normal server client reads and updates university details; the column grant above keeps the application-editable fields available without allowing authenticated users to change `status` or `created_by`. Approve/reject universities as an operator through Supabase.

## Storage

Create three **public** buckets in **Supabase → Storage**:

| Bucket | Stored objects |
|---|---|
| `logos` | `{university_id}/logo.{jpg|png|webp}` |
| `faculty-photos` | `{university_id}/{faculty_id}.{jpg|png|webp}` |
| `location-photos` | `{university_id}/{location_id}.{jpg|png|webp}` |

Set the bucket file-size limit to 2 MB and, where available, allow only `image/jpeg`, `image/png`, and `image/webp`. The application performs its own upload validation and uploads through the server-only service-role client. Public buckets allow the app to display generated public URLs; no authenticated browser-upload policies are needed for the current implementation. Never send the service-role key to the browser.

## Approving a university

The app has no approval dashboard. In **Supabase → Table Editor → `universities`**, change the selected university's `status` from `pending` to `approved`. Approved status is required for student search and joining.

## Demo data

There is no checked-in seed script. Add test records through the admin UI or a controlled Supabase workflow. Useful assistant test data includes several locations, faculty linked to locations, and recent notices.
