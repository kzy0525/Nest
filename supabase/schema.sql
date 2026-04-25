-- ============================================================
-- Nest — Supabase schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ── Clubs ────────────────────────────────────────────────────
create table if not exists clubs (
  id                  bigint primary key generated always as identity,
  name                text not null,
  description         text,
  category            jsonb default '[]',
  meeting_time        text,
  meeting_location    text,
  contact_email       text,
  contact_phone       text,
  website             text,
  instagram           text,
  twitter             text,
  facebook            text,
  application_deadline      text,
  interview_start_date      text,
  interview_end_date        text,
  rating              real default 0,
  review_count        integer default 0,
  member_count        integer default 0,
  slogan              text,
  acceptance_rate     integer default 0,
  applications_open   text,
  results_released    text,
  open_positions      jsonb default '[]',
  available_spots     integer default 0,
  application_questions jsonb default '[]',
  logo                text,
  backdrop            text,
  hiring_package      text,
  is_hiring           boolean default false,
  has_interviews      boolean default false,
  created_at          timestamptz default now()
);

-- ── Reviews ──────────────────────────────────────────────────
create table if not exists reviews (
  id            bigint primary key generated always as identity,
  club_id       bigint references clubs(id) on delete cascade,
  student_name  text,
  club_position text,
  rating        integer check (rating between 1 and 5),
  review_text   text,
  created_at    timestamptz default now()
);

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  email       text,
  program     text,
  year        text,
  school      text,
  pronouns    text,
  bio         text,
  goals       text,
  avatar_url    text,
  current_clubs jsonb default '[]',
  role          text default 'student',   -- 'student' | 'club' | 'admin'
  user_type     text default 'student',   -- 'student' | 'club'
  created_at  timestamptz default now()
);

-- ── Favorites ─────────────────────────────────────────────────
create table if not exists favorites (
  id         bigint primary key generated always as identity,
  user_id    uuid references auth.users(id) on delete cascade,
  club_id    bigint references clubs(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, club_id)
);

-- ── Applications ──────────────────────────────────────────────
create table if not exists applications (
  id                   bigint primary key generated always as identity,
  user_id              uuid references auth.users(id) on delete cascade,
  club_id              bigint references clubs(id) on delete cascade,
  club_name            text,
  club_logo            text,
  position             text,
  second_role          text,
  year                 text,
  program              text,
  email                text,
  phone                text,
  answers              jsonb default '{}',
  resume_file_name     text,
  status               text default 'Incomplete',
  application_deadline text,
  interview_start_date text,
  results_released     text,
  date_submitted       text,
  created_at           timestamptz default now()
);

-- ── Row-Level Security ────────────────────────────────────────
alter table clubs        enable row level security;
alter table reviews      enable row level security;
alter table profiles     enable row level security;
alter table favorites    enable row level security;
alter table applications enable row level security;

-- Clubs: publicly readable, admins or club users can write
create policy "clubs_select"  on clubs for select using (true);
create policy "clubs_insert"  on clubs for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and (role = 'admin' or user_type = 'club')));
create policy "clubs_update"  on clubs for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and (role = 'admin' or user_type = 'club')));
create policy "clubs_delete"  on clubs for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Reviews: publicly readable, authenticated users can insert
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert to authenticated with check (true);

-- Profiles: users manage only their own
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_all"    on profiles for all    to authenticated using (auth.uid() = id);

-- Favorites: users manage only their own
create policy "favorites_all" on favorites for all to authenticated using (auth.uid() = user_id);

-- Applications: students manage their own; club users can read applications to their club by name
create policy "applications_student" on applications for all    to authenticated using (auth.uid() = user_id);
create policy "applications_club_read" on applications for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and user_type = 'club' and name = club_name));

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, school, role, user_type)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'school',
    coalesce(new.raw_user_meta_data ->> 'role',      'student'),
    coalesce(new.raw_user_meta_data ->> 'user_type', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Supabase Storage buckets ──────────────────────────────────
-- Run these separately in the Storage tab, or via the dashboard:
-- 1. Create bucket "club-assets"   (public)
-- 2. Create bucket "avatars"       (public)
