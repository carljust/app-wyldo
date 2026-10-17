\set ON_ERROR_STOP on
begin;
do $$ begin if not exists(select 1 from public.profiles where id='33333333-3333-4333-8333-333333333333') then raise exception 'Existing account not backfilled';end if;end $$;
-- Two real database principals via the authenticated role and separate JWT subjects.
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.quests(id,slug,title,status,start_latitude,start_longitude,field_verified)
 values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','test-approved','Approved fixture','published',51,8,true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','test-draft','Draft secret','draft',51,8,false);
insert into public.quest_versions(id,quest_id,version,status) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,'published'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,'draft');
insert into public.quest_routes values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','{"type":"LineString","coordinates":[[8,51],[8.01,51.01]]}','gpx_import','field_verified','1'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','{"type":"LineString","coordinates":[[8,51],[8.01,51.01]]}','gpx_import','draft','1');
insert into wyldo_private.quest_stations(quest_version_id,chapter) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd',1);
insert into public.assets(quest_version_id,storage_path,approved) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','approved.png',true),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','wyldo_private.png',true),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','unapproved.png',false);
insert into storage.objects(bucket_id,name) values ('wyldo-quest-media','approved.png'),('wyldo-quest-media','wyldo_private.png'),('wyldo-quest-media','unapproved.png');
insert into public.play_sessions(id,user_id,quest_version_id) values
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','22222222-2222-4222-8222-222222222222','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into public.xp_ledger(user_id,session_id,event_id,amount) values ('11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','12345678-1234-4123-8123-123456789abc',100);
-- Database uniqueness prevents replay even on a trusted server retry.
do $$ begin
 begin
  insert into public.xp_ledger(user_id,session_id,event_id,amount) values ('11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','12345678-1234-4123-8123-123456789abc',100);
  raise exception 'Replay unexpectedly accepted';
 exception when unique_violation then null; end;
 begin
  insert into public.quests(slug,title,status,start_latitude,start_longitude) values('unsafe','Unverified','published',51,8);
  raise exception 'Unverified publication accepted';
 exception when check_violation then null; end;
end $$;
set local role anon;
do $$ begin
 if (select count(*) from public.quest_summaries)<>1 then raise exception 'Anon quest leak';end if;
 if (select count(*) from public.quest_routes)<>1 then raise exception 'Anon route leak';end if;
 if (select count(*) from storage.objects)<>1 then raise exception 'Storage leak';end if;
 begin perform * from wyldo_private.quest_stations;raise exception 'Private stations accessible';exception when insufficient_privilege then null;end;
 begin perform * from public.profiles;raise exception 'Anon profile accessible';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.profiles)<>1 then raise exception 'Profile isolation failure';end if;
 if (select count(*) from public.play_sessions)<>1 then raise exception 'Session isolation failure';end if;
 if (select count(*) from public.xp_ledger)<>1 then raise exception 'XP isolation failure';end if;
 update public.profiles set display_name='Family A' where id='11111111-1111-4111-8111-111111111111';
 update public.profiles set display_name='Hacked' where id='22222222-2222-4222-8222-222222222222';
 if found then raise exception 'Cross-user update accepted';end if;
 begin update public.profiles set id='33333333-3333-4333-8333-333333333333';raise exception 'Profile ownership writable';exception when insufficient_privilege then null;end;
 begin insert into public.xp_ledger(user_id,session_id,event_id,amount) values(auth.uid(),'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',gen_random_uuid(),9999);raise exception 'Client XP accepted';exception when insufficient_privilege then null;end;
 begin update public.play_sessions set status='completed';raise exception 'Client completion accepted';exception when insufficient_privilege then null;end;
 begin update public.quests set status='published';raise exception 'Client publishing accepted';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('wyldo-quest-media','hacked.png');raise exception 'Client upload accepted';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if (select count(*) from public.profiles)<>1 then raise exception 'Second user isolation failure';end if;
 if (select count(*) from public.xp_ledger)<>0 then raise exception 'Second user sees first rewards';end if;
 if exists(select 1 from public.profiles where display_name='Hacked') then raise exception 'Other profile modified';end if;
end $$;
reset role;
rollback;
\echo 'PASS: PostgreSQL RLS, two-user isolation, draft secrecy, storage policy, mutation denial, replay uniqueness and publication constraints'
