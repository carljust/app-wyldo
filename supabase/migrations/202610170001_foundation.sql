-- Wyldo Phase 3. Standalone atomic migration; inspect an existing project first.
begin;
create schema wyldo_private;
revoke all on schema wyldo_private from public, anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Entdeckerfamilie' check (char_length(display_name) between 1 and 80),
 created_at timestamptz not null default now()
);
create table public.quests (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 title text not null,
 subtitle text not null default '',
 description text not null default '',
 status text not null default 'draft' check (status in ('draft','published','archived')),
 start_latitude double precision check (start_latitude between -90 and 90),
 start_longitude double precision check (start_longitude between -180 and 180),
 field_verified boolean not null default false,
 outdoor_playable boolean not null default false,
 recommended_age integer check (recommended_age >= 0),
 difficulty text check (difficulty in ('easy','medium','hard')),
 estimated_distance_m integer check (estimated_distance_m > 0),
 estimated_duration_min integer check (estimated_duration_min > 0),
 chapters integer not null default 0 check (chapters >= 0),
 seals integer not null default 0 check (seals >= 0),
 created_at timestamptz not null default now(),
 constraint publication_requires_field_validation check (status <> 'published' or (field_verified and start_latitude is not null and start_longitude is not null)),
 constraint outdoor_requires_publication check (not outdoor_playable or (status='published' and field_verified))
);
create table public.quest_versions (
 id uuid primary key default gen_random_uuid(),
 quest_id uuid not null references public.quests(id) on delete cascade,
 version integer not null check (version > 0),
 status text not null default 'draft' check (status in ('draft','published','retired')),
 created_at timestamptz not null default now(),
 unique(quest_id,version)
);
create table public.quest_routes (
 quest_version_id uuid primary key references public.quest_versions(id) on delete cascade,
 geometry jsonb not null check (jsonb_typeof(geometry)='object' and geometry->>'type'='LineString' and jsonb_typeof(geometry->'coordinates')='array' and jsonb_array_length(geometry->'coordinates') >= 2),
 source text not null check (source in ('gpx_import','verified_author_route')),
 approval text not null default 'draft' check (approval in ('draft','field_verified')),
 route_version text not null
);
-- Not in the public API: candidates, observations, validation references and solutions.
create table wyldo_private.quest_stations (
 id uuid primary key default gen_random_uuid(),
 quest_version_id uuid not null references public.quest_versions(id) on delete cascade,
 chapter integer not null check (chapter between 1 and 8),
 field_validation_status text not null default 'not_verified' check (field_validation_status in ('not_verified','approved')),
 approved_trigger jsonb,
 answer_validation_ref text,
 unique(quest_version_id,chapter),
 check (field_validation_status <> 'approved' or approved_trigger is not null)
);
create table public.assets (
 id uuid primary key default gen_random_uuid(),
 quest_version_id uuid not null references public.quest_versions(id) on delete cascade,
 storage_path text unique not null,
 approved boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.play_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 quest_version_id uuid not null references public.quest_versions(id),
 unique(id,user_id),
 status text not null default 'not_started' check (status in ('not_started','active','paused','completed')),
 created_at timestamptz not null default now()
);
create table public.xp_ledger (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null references public.play_sessions(id),
 event_id uuid not null,
 amount integer not null check (amount > 0),
 created_at timestamptz not null default now(),
 foreign key(session_id,user_id) references public.play_sessions(id,user_id),
 unique (session_id,event_id)
);
create table public.offline_sync_operations (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null references public.play_sessions(id),
 foreign key(session_id,user_id) references public.play_sessions(id,user_id),
 status text not null default 'received' check (status in ('received','validated','rejected')),
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.quest_versions enable row level security;
alter table public.quest_routes enable row level security;
alter table wyldo_private.quest_stations enable row level security;
alter table public.assets enable row level security;
alter table public.play_sessions enable row level security;
alter table public.xp_ledger enable row level security;
alter table public.offline_sync_operations enable row level security;

-- Remove permissive default grants. Grant only the operations required now.
revoke all on public.profiles, public.quests, public.quest_versions, public.quest_routes,
 public.assets, public.play_sessions, public.xp_ledger, public.offline_sync_operations from anon, authenticated;
revoke all on wyldo_private.quest_stations from public, anon, authenticated;
grant select on public.quests, public.quest_versions, public.quest_routes, public.assets to anon, authenticated;
grant select on public.profiles, public.play_sessions, public.xp_ledger, public.offline_sync_operations to authenticated;
grant update(display_name) on public.profiles to authenticated;

create policy own_profile_read on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy own_profile_update on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy published_quests on public.quests for select to anon,authenticated using (status='published' and field_verified);
create policy published_versions on public.quest_versions for select to anon,authenticated using (
 status='published' and exists(select 1 from public.quests q where q.id=quest_id));
create policy verified_routes on public.quest_routes for select to anon,authenticated using (
 approval='field_verified' and exists(select 1 from public.quest_versions v where v.id=quest_version_id));
create policy approved_assets on public.assets for select to anon,authenticated using (
 approved and exists(select 1 from public.quest_versions v where v.id=quest_version_id));
create policy own_sessions on public.play_sessions for select to authenticated using (user_id=(select auth.uid()));
create policy own_xp on public.xp_ledger for select to authenticated using (user_id=(select auth.uid()));
create policy own_sync on public.offline_sync_operations for select to authenticated using (user_id=(select auth.uid()));

-- A stable summary payload does not expose track geometry, stations or answers.
create view public.quest_summaries with (security_invoker=true) as
 select id,slug,title,subtitle,start_latitude,start_longitude,recommended_age,difficulty,
 estimated_distance_m,estimated_duration_min from public.quests;
grant select on public.quest_summaries to anon,authenticated;

create function wyldo_private.create_user_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id) values(new.id);
 return new;
end;
$$;
revoke all on function wyldo_private.create_user_profile() from public,anon,authenticated;
create trigger wyldo_on_auth_user_created after insert on auth.users for each row execute function wyldo_private.create_user_profile();
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;

-- Private bucket: access only through approved assets of published versions.
insert into storage.buckets(id,name,public) values('wyldo-quest-media','wyldo-quest-media',false);
create policy published_quest_media on storage.objects for select to anon,authenticated using (
 bucket_id='wyldo-quest-media' and exists(select 1 from public.assets a where a.storage_path=name));
-- No client upload, reward mutation, progress mutation or sync write policy.
-- Server command validation and the quest engine belong to later milestones.

commit;
