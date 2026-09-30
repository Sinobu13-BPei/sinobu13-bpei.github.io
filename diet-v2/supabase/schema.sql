-- SHINOBU HEALTH 25 Ver.2
-- Run in Supabase SQL Editor.

create table if not exists public.daily_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric(5,1),
  waist numeric(5,1),
  steps integer,
  water_ml integer,
  sleep_hours numeric(4,1),
  memo text,
  checks jsonb not null default '{}'::jsonb,
  meals jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  kind text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_photos (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  kind text,
  title text,
  estimated_kcal numeric(7,1),
  estimated_range text,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.daily_logs enable row level security;
alter table public.plans enable row level security;
alter table public.meal_photos enable row level security;

drop policy if exists "daily own select" on public.daily_logs;
drop policy if exists "daily own insert" on public.daily_logs;
drop policy if exists "daily own update" on public.daily_logs;
drop policy if exists "daily own delete" on public.daily_logs;
create policy "daily own select" on public.daily_logs for select using (auth.uid() = user_id);
create policy "daily own insert" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "daily own update" on public.daily_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily own delete" on public.daily_logs for delete using (auth.uid() = user_id);

drop policy if exists "plans own select" on public.plans;
drop policy if exists "plans own insert" on public.plans;
drop policy if exists "plans own update" on public.plans;
drop policy if exists "plans own delete" on public.plans;
create policy "plans own select" on public.plans for select using (auth.uid() = user_id);
create policy "plans own insert" on public.plans for insert with check (auth.uid() = user_id);
create policy "plans own update" on public.plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "plans own delete" on public.plans for delete using (auth.uid() = user_id);

drop policy if exists "photos own select" on public.meal_photos;
drop policy if exists "photos own insert" on public.meal_photos;
drop policy if exists "photos own update" on public.meal_photos;
drop policy if exists "photos own delete" on public.meal_photos;
create policy "photos own select" on public.meal_photos for select using (auth.uid() = user_id);
create policy "photos own insert" on public.meal_photos for insert with check (auth.uid() = user_id);
create policy "photos own update" on public.meal_photos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photos own delete" on public.meal_photos for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "meal photos own read" on storage.objects;
drop policy if exists "meal photos own insert" on storage.objects;
drop policy if exists "meal photos own update" on storage.objects;
drop policy if exists "meal photos own delete" on storage.objects;

create policy "meal photos own read"
on storage.objects for select
using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal photos own insert"
on storage.objects for insert
with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal photos own update"
on storage.objects for update
using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal photos own delete"
on storage.objects for delete
using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
