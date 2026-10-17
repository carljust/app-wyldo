-- Phase 4: untrusted navigation checkpoints, never authoritative rewards/progress.
begin;
create table public.navigation_checkpoints (
 session_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 quest_version_id uuid not null references public.quest_versions(id),
 revision bigint not null default 0 check(revision>=0),
 phase text not null check(phase in ('not_started','navigating_to_start','ready_at_start','intro','awaiting_target','navigating_to_station','station_event')),
 paused boolean not null default false,
 updated_at timestamptz not null default now(),
 unique(session_id,user_id)
);
create table wyldo_private.navigation_operations (
 operation_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null references public.navigation_checkpoints(session_id) on delete cascade,
 request_fingerprint bytea not null,
 receipt jsonb not null
);
alter table public.navigation_checkpoints enable row level security;
alter table wyldo_private.navigation_operations enable row level security;
revoke all on public.navigation_checkpoints from public,anon,authenticated;
revoke all on wyldo_private.navigation_operations from public,anon,authenticated;
grant select on public.navigation_checkpoints to authenticated;
create policy own_navigation_checkpoints on public.navigation_checkpoints for select to authenticated using(user_id=(select auth.uid()));

create function public.save_navigation_checkpoint(p_operation_id uuid,p_session_id uuid,p_quest_version_id uuid,p_revision bigint,p_phase text,p_paused boolean,p_owner_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 caller uuid := auth.uid();
 existing public.navigation_checkpoints%rowtype;
 prior wyldo_private.navigation_operations%rowtype;
 fingerprint bytea;
 receipt jsonb;
begin
 if caller is null or caller is distinct from p_owner_id then raise exception 'Authentication required' using errcode='42501';end if;
 if p_operation_id is null or p_session_id is null or p_quest_version_id is null or p_revision is null or p_revision<1 or p_phase is null or p_phase not in ('not_started','navigating_to_start','ready_at_start','intro','awaiting_target','navigating_to_station','station_event') or p_paused is null then
  raise exception 'Invalid checkpoint' using errcode='22023';end if;
 -- Serialize retries and competing clients before reading receipts or changing state.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
 fingerprint:=pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_session_id,p_quest_version_id,p_revision,p_phase,p_paused)::text,'UTF8'));
 select * into prior from wyldo_private.navigation_operations where operation_id=p_operation_id;
 if found then
  if prior.user_id<>caller or prior.request_fingerprint<>fingerprint then raise exception 'Operation replay mismatch' using errcode='42501';end if;
  return prior.receipt;
 end if;
 if not exists(select 1 from public.quest_versions v join public.quests q on q.id=v.quest_id join public.quest_routes r on r.quest_version_id=v.id and r.approval='field_verified' where v.id=p_quest_version_id and v.status='published' and q.status='published' and q.field_verified and q.outdoor_playable) then
  raise exception 'Quest is not approved for outdoor navigation' using errcode='42501';end if;
 insert into public.navigation_checkpoints(session_id,user_id,quest_version_id,revision,phase,paused)
 values(p_session_id,caller,p_quest_version_id,0,'not_started',false) on conflict(session_id) do nothing;
 select * into existing from public.navigation_checkpoints where session_id=p_session_id for update;
 if existing.user_id<>caller or existing.quest_version_id<>p_quest_version_id then raise exception 'Session ownership/version mismatch' using errcode='42501';end if;
 if p_revision>existing.revision then
  update public.navigation_checkpoints set revision=p_revision,phase=p_phase,paused=p_paused,updated_at=now() where session_id=p_session_id;
 end if;
 receipt:=pg_catalog.jsonb_build_object('operationId',p_operation_id,'acknowledged',true,'revision',greatest(p_revision,existing.revision),'applied',p_revision>existing.revision);
 insert into wyldo_private.navigation_operations(operation_id,user_id,session_id,request_fingerprint,receipt) values(p_operation_id,caller,p_session_id,fingerprint,receipt);
 return receipt;
end;
$$;
revoke all on function public.save_navigation_checkpoint(uuid,uuid,uuid,bigint,text,boolean,uuid) from public,anon;
grant execute on function public.save_navigation_checkpoint(uuid,uuid,uuid,bigint,text,boolean,uuid) to authenticated;
commit;
