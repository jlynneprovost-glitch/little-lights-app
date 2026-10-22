-- Little Lights: run in the Supabase SQL editor before seed.sql.
-- This script is repeatable. The service-role key belongs on the server only.
begin;

create extension if not exists pgcrypto;

create or replace function public.valid_story_pages(value jsonb)
returns boolean language plpgsql immutable strict set search_path = '' as $$
declare page jsonb;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) not between 1 and 30 then
    return false;
  end if;
  for page in select jsonb_array_elements(value) loop
    if jsonb_typeof(page) is distinct from 'object'
      or jsonb_typeof(page -> 'text') is distinct from 'string'
      or length(btrim(page ->> 'text')) = 0
      or cardinality(regexp_split_to_array(btrim(page ->> 'text'), '\s+')) > 10
      or jsonb_typeof(page -> 'scene') is distinct from 'string'
      or length(btrim(page ->> 'scene')) = 0 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

create or replace function public.valid_story_quiz(value jsonb)
returns boolean language plpgsql immutable strict set search_path = '' as $$
declare question jsonb;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) <> 2 then
    return false;
  end if;
  for question in select jsonb_array_elements(value) loop
    if jsonb_typeof(question) is distinct from 'object'
      or jsonb_typeof(question -> 'question') is distinct from 'string'
      or length(btrim(question ->> 'question')) = 0
      or jsonb_typeof(question -> 'answers') is distinct from 'array'
      or jsonb_array_length(question -> 'answers') <> 3
      or jsonb_typeof(question -> 'correctIndex') is distinct from 'number'
      or coalesce(question ->> 'correctIndex', '') not in ('0', '1', '2') then
      return false;
    end if;
    if exists (
      select 1 from jsonb_array_elements(question -> 'answers') answer
      where jsonb_typeof(answer) <> 'string' or length(btrim(answer #>> '{}')) = 0
    ) then return false; end if;
  end loop;
  return true;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  kid_name text not null default '' check (char_length(kid_name) <= 50),
  kid_age integer check (kid_age between 3 and 7),
  bedtime time not null default '19:30',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  deletion_pending_at timestamptz,
  subscription_status text not null default 'free'
    check (subscription_status in ('free', 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  created_at timestamptz not null default now()
);
alter table public.users add column if not exists deletion_pending_at timestamptz;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  verse text not null check (char_length(verse) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  theme text not null default 'kindness',
  minutes integer not null default 3 check (minutes between 1 and 30),
  age_group text not null default '3–7',
  cover_scene text not null default 'ark',
  cover_image_url text,
  is_free boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  pages jsonb not null check (public.valid_story_pages(pages)),
  quiz jsonb not null check (public.valid_story_quiz(quiz)),
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  completed_at timestamptz not null default now(),
  completed_day date not null default (now() at time zone 'UTC')::date,
  stars_earned integer not null default 1 check (stars_earned between 1 and 3),
  coloring_saved_url text,
  unique (user_id, story_id, completed_day)
);

create table if not exists public.stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  sticker_id text not null check (char_length(sticker_id) between 1 and 100),
  earned_at timestamptz not null default now(),
  unique (user_id, sticker_id)
);

-- Only the verified webhook/server can read or write event receipts.
create table if not exists public.stripe_events (
  id text primary key,
  created_at timestamptz not null default now()
);

create index if not exists progress_user_completed_idx on public.progress(user_id, completed_at desc);
create index if not exists stickers_user_earned_idx on public.stickers(user_id, earned_at desc);
create index if not exists stories_published_idx on public.stories(status, created_at);

alter table public.users enable row level security;
alter table public.stories enable row level security;
alter table public.progress enable row level security;
alter table public.stickers enable row level security;
alter table public.stripe_events enable row level security;

-- Explicit column grants prevent a parent from granting their own subscription.
revoke all on public.users, public.stories, public.progress, public.stickers, public.stripe_events from anon, authenticated;
grant select on public.users to authenticated;
grant update (kid_name, kid_age, bedtime) on public.users to authenticated;
grant select on public.stories to anon, authenticated;
grant select on public.progress, public.stickers to authenticated;
grant all on public.users, public.stories, public.progress, public.stickers, public.stripe_events to service_role;

drop policy if exists users_read_own on public.users;
create policy users_read_own on public.users for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists users_update_own_profile on public.users;
create policy users_update_own_profile on public.users for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Metadata for locked titles is served by /api/stories, which omits their pages.
-- Direct browser Supabase queries cannot retrieve a paid story without access.
drop policy if exists stories_read_free on public.stories;
create policy stories_read_free on public.stories for select to anon
  using (status = 'published' and is_free);
drop policy if exists stories_read_accessible on public.stories;
create policy stories_read_accessible on public.stories for select to authenticated
  using (
    status = 'published' and (
      is_free or exists (
        select 1 from public.users
        where id = (select auth.uid()) and subscription_status in ('active', 'trialing')
      )
    )
  );
drop policy if exists progress_read_own on public.progress;
create policy progress_read_own on public.progress for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists stickers_read_own on public.stickers;
create policy stickers_read_own on public.stickers for select to authenticated
  using (user_id = (select auth.uid()));

-- Authentication, not client-provided metadata, establishes profile identity.
create or replace function public.create_parent_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare proposed_age integer;
declare proposed_bedtime time := '19:30';
begin
  if new.raw_user_meta_data ->> 'kid_age' ~ '^[3-7]$' then
    proposed_age := (new.raw_user_meta_data ->> 'kid_age')::integer;
  end if;
  if new.raw_user_meta_data ->> 'bedtime' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
    proposed_bedtime := (new.raw_user_meta_data ->> 'bedtime')::time;
  end if;
  insert into public.users (id, email, kid_name, kid_age, bedtime)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'kid_name', ''), 50),
    proposed_age,
    proposed_bedtime
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_parent_profile() from public, anon, authenticated;
drop trigger if exists little_lights_auth_user_created on auth.users;
create trigger little_lights_auth_user_created
  after insert on auth.users for each row execute procedure public.create_parent_profile();

-- One transaction awards a nightly completion and its next sticker. A per-parent
-- lock serializes simultaneous requests, so retries cannot mint extra stickers.
create or replace function public.complete_story(p_story_id uuid, p_coloring_url text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  parent_id uuid := auth.uid();
  completion_day date := (now() at time zone 'UTC')::date;
  completion public.progress%rowtype;
  earned public.stickers%rowtype;
  next_sticker text;
  is_new boolean := false;
begin
  if parent_id is null then
    raise exception 'Sign in to save your progress.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.users where id = parent_id and deletion_pending_at is null) then
    raise exception 'Parent account not found.' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.stories s
    where s.id = p_story_id and s.status = 'published' and (
      s.is_free or exists (
        select 1 from public.users u
        where u.id = parent_id and u.subscription_status in ('active', 'trialing')
      )
    )
  ) then
    raise exception 'This story requires an active subscription.' using errcode = '42501';
  end if;
  if p_coloring_url is not null and (
    length(p_coloring_url) > 1000 or
    p_coloring_url !~ ('^storage://little-lights-coloring/' || parent_id::text || '/[a-zA-Z0-9/_-]+[.](png|webp)$')
  ) then
    raise exception 'Invalid saved coloring location.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(parent_id::text, 0));
  insert into public.progress (user_id, story_id, completed_day, coloring_saved_url)
  values (parent_id, p_story_id, completion_day, p_coloring_url)
  on conflict (user_id, story_id, completed_day) do nothing
  returning * into completion;
  is_new := found;

  if not is_new then
    update public.progress set coloring_saved_url = coalesce(p_coloring_url, coloring_saved_url)
    where user_id = parent_id and story_id = p_story_id and completed_day = completion_day
    returning * into completion;
  else
    select candidates.number::text into next_sticker from generate_series(0, 29) as candidates(number)
    where not exists (
      select 1 from public.stickers s
      where s.user_id = parent_id and s.sticker_id = candidates.number::text
    ) order by candidates.number limit 1;
    if next_sticker is not null then
      insert into public.stickers(user_id, sticker_id)
      values(parent_id, next_sticker)
      on conflict(user_id, sticker_id) do nothing returning * into earned;
    end if;
  end if;

  return jsonb_build_object(
    'progressId', completion.id,
    'stickerId', earned.sticker_id,
    'earnedAt', earned.earned_at,
    'completedAt', completion.completed_at,
    'newCompletion', is_new
  );
end;
$$;
revoke all on function public.complete_story(uuid, text) from public, anon;
grant execute on function public.complete_story(uuid, text) to authenticated;

-- Media access is mediated by the API. Admin uploads use the server service key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('little-lights-media', 'little-lights-media', false, 20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'audio/mpeg'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('little-lights-coloring', 'little-lights-coloring', false, 5242880,
  array['image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

commit;
