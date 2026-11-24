-- TripX Schema & Security Policies (RLS)
-- Run this script in your SQL Editor.

-- 1. Profiles table (automatically populated on user registration)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Places table
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) > 0),
  main_image_url text,
  extra_image_urls text[] not null default '{}',
  lat double precision,
  lng double precision,
  address text,
  pin_x double precision,
  pin_y double precision,
  district_id text,
  district_name text,
  regions text[] not null default '{}',
  place_types text[] not null default '{}',
  companions text[] not null default '{}',
  crowd_sizes text[] not null default '{}',
  seasons text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.places add column if not exists lat double precision;
alter table public.places add column if not exists lng double precision;
alter table public.places add column if not exists address text;

alter table public.places enable row level security;

create policy "Public read access for places"
  on public.places
  for select
  using (true);

create policy "Authenticated insert for places"
  on public.places
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners update own places"
  on public.places
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners delete own places"
  on public.places
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Favorites table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table public.favorites enable row level security;

create policy "Users view own favorites"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users add own favorites"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users remove own favorites"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Storage bucket for place images
insert into storage.buckets (id, name, public)
values ('place-images', 'place-images', true)
on conflict (id) do nothing;

create policy "Public read place images"
  on storage.objects
  for select
  using (bucket_id = 'place-images');

create policy "Authenticated users upload place images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'place-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own place images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'place-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
