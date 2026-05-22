-- =====================================================================
-- Streamly v1 schema
-- Run this in the Supabase SQL editor (Project → SQL → New query → Run).
-- =====================================================================

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  n int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username',
             split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    n := n + 1;
    final_username := base_username || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, final_username,
          coalesce(new.raw_user_meta_data->>'display_name', final_username));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- videos ----------
create table if not exists public.videos (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text,
  youtube_id     text not null,                 -- e.g. dQw4w9WgXcQ
  thumbnail_url  text,
  category       text default 'General',
  published      boolean not null default true,
  approval_status text default 'approved',     -- approved, pending, rejected
  view_count     int  not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists videos_created_idx on public.videos (created_at desc);
create index if not exists videos_author_idx  on public.videos (author_id);
create index if not exists videos_category_idx on public.videos (category);

-- ---------- blogs ----------
create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  content     text not null,                     -- markdown
  cover_url   text,
  category    text default 'General',
  published   boolean not null default true,
  approval_status text default 'approved',     -- approved, pending, rejected
  view_count  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists blogs_created_idx on public.blogs (created_at desc);
create index if not exists blogs_author_idx  on public.blogs (author_id);
create index if not exists blogs_category_idx on public.blogs (category);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.videos   enable row level security;
alter table public.blogs    enable row level security;


-- Add role and status columns to profiles
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists status text default 'active'; -- active, suspended, banned

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles update" on public.profiles for update using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


drop policy if exists "videos read"   on public.videos;
drop policy if exists "videos insert" on public.videos;
drop policy if exists "videos update" on public.videos;
drop policy if exists "videos delete" on public.videos;
create policy "videos read"   on public.videos for select using (
  published or author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "videos insert" on public.videos for insert with check (
  author_id = auth.uid() and (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.role = 'moderator'))
  )
);
create policy "videos update" on public.videos for update using (
  author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "videos delete" on public.videos for delete using (
  author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);


drop policy if exists "blogs read"   on public.blogs;
drop policy if exists "blogs insert" on public.blogs;
drop policy if exists "blogs update" on public.blogs;
drop policy if exists "blogs delete" on public.blogs;
create policy "blogs read"   on public.blogs for select using (
  published or author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "blogs insert" on public.blogs for insert with check (
  author_id = auth.uid() and (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.role = 'moderator'))
  )
);
create policy "blogs update" on public.blogs for update using (
  author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "blogs delete" on public.blogs for delete using (
  author_id = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- creator_requests table
create table if not exists public.creator_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text default 'pending',  -- pending, approved, rejected
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists creator_requests_user_idx on public.creator_requests (user_id);

alter table public.creator_requests enable row level security;
drop policy if exists "creator_requests read" on public.creator_requests;
drop policy if exists "creator_requests insert" on public.creator_requests;
drop policy if exists "creator_requests update" on public.creator_requests;
drop policy if exists "creator_requests delete" on public.creator_requests;
create policy "creator_requests read" on public.creator_requests for select using (
  user_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "creator_requests insert" on public.creator_requests for insert with check (user_id = auth.uid());
create policy "creator_requests update" on public.creator_requests for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "creator_requests delete" on public.creator_requests for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
