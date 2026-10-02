# LocoUni: Database

Run the SQL below in **Supabase → SQL Editor**.

## Tables
| Table | Purpose |
|---|---|
| `universities` | One row per university (`pending` until approved) |
| `profiles` | One row per user: role and joined university |
| `locations` | Campus places with map coordinates |
| `faculty` | Faculty and staff directory |
| `notices` | Notices with category and priority |
| `chat_usage` | Logs AI messages for rate limiting |

## Schema

```sql
create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text, country text, website text,
  description text, logo_url text,
  lat double precision, lng double precision,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  university_id uuid references universities(id) on delete set null
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  name text not null,
  type text,            -- block, canteen, library, hostel, ground, gate...
  description text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

create table faculty (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  name text not null,
  role text,
  department text,
  cabin_number text,
  location_id uuid references locations(id) on delete set null,
  photo_url text, email text, phone text,
  created_at timestamptz default now()
);

create table notices (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  title text not null,
  body text,
  category text not null check (category in
    ('academic','exams','placements','emergency','events','hostel')),
  priority text not null default 'normal' check (priority in
    ('urgent','high','normal')),
  event_date timestamptz,
  created_at timestamptz default now()
);

create table chat_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Indexes
create index on locations (university_id);
create index on faculty (university_id);
create index on faculty (university_id, department);
create index on notices (university_id, category, priority);
create index on chat_usage (user_id, created_at);
create index on universities (status, name);
```

## Row-Level Security

```sql
alter table universities enable row level security;
alter table profiles     enable row level security;
alter table locations    enable row level security;
alter table faculty      enable row level security;
alter table notices      enable row level security;
alter table chat_usage   enable row level security;

-- Helper: is the current user an admin of this university?
create or replace function is_admin_of(uni uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and university_id = uni
  );
$$;

-- Universities: anyone can read approved ones; creators can read their own
create policy "read approved or own" on universities for select
  using (status = 'approved' or created_by = auth.uid());
create policy "admin update own university" on universities for update
  using (is_admin_of(id)) with check (is_admin_of(id));

-- Profiles: users can only READ their own profile.
-- Inserts and updates happen in Server Actions with the service-role key,
-- so a user can never make themselves an admin.
create policy "read own profile" on profiles for select
  using (id = auth.uid());

-- Content tables: public read, writes only by that university's admin
create policy "read locations" on locations for select using (true);
create policy "admin write locations" on locations for all
  using (is_admin_of(university_id)) with check (is_admin_of(university_id));

create policy "read faculty" on faculty for select using (true);
create policy "admin write faculty" on faculty for all
  using (is_admin_of(university_id)) with check (is_admin_of(university_id));

create policy "read notices" on notices for select using (true);
create policy "admin write notices" on notices for all
  using (is_admin_of(university_id)) with check (is_admin_of(university_id));

-- chat_usage: no policies = only the service-role key can access it
```

> Content tables are readable by anyone with the API key. For the MVP that is fine because campus info is meant to be public. If you later want it private to joined students, change the `read` policies to check `profiles.university_id`.

## Storage

Create two **public** buckets in Supabase → Storage: `faculty-photos` and `logos`.

```sql
create policy "public read images" on storage.objects for select
  using (bucket_id in ('faculty-photos','logos'));

create policy "authenticated upload images" on storage.objects for insert
  to authenticated
  with check (bucket_id in ('faculty-photos','logos'));

create policy "authenticated update own images" on storage.objects for update
  to authenticated using (owner = auth.uid());

create policy "authenticated delete own images" on storage.objects for delete
  to authenticated using (owner = auth.uid());
```

Enforce the 2 MB and image-type limits in the upload code and in the bucket settings.

## Approving a university (MVP)
In Supabase → Table Editor → `universities`, change `status` from `pending` to `approved`.

## Seed data
Add one demo university with 5 locations, 8 faculty, and 10 notices before Day 3 so the AI has something to answer from.
