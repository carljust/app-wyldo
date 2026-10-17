\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.quests(id,slug,title,status,start_latitude,start_longitude,field_verified,outdoor_playable) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','navigation-approved','Approved test','published',51,8,true,true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','navigation-draft','Draft test','draft',51,8,false,false);
insert into public.quest_versions(id,quest_id,version,status) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,'published'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,'draft');
insert into public.quest_routes(quest_version_id,geometry,source,approval,route_version) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc','{"type":"LineString","coordinates":[[8,51],[8.01,51.01]]}','verified_author_route','field_verified','test-v1');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$declare a jsonb;b jsonb;begin
 begin perform public.save_navigation_checkpoint(gen_random_uuid(),gen_random_uuid(),'cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,'intro',false,'22222222-2222-4222-8222-222222222222');raise exception 'Changed auth identity accepted';exception when insufficient_privilege then null;end;
 a:=public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000001','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,'navigating_to_start',false,auth.uid());
 b:=public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000001','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,'navigating_to_start',false,auth.uid());
 if a<>b or not(a->>'acknowledged')::boolean then raise exception 'Idempotent receipt failed';end if;
 begin perform public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000001','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',9,'intro',false,auth.uid());raise exception 'Altered replay accepted';exception when insufficient_privilege then null;end;
 perform public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000002','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',5,'ready_at_start',false,auth.uid());
 a:=public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000003','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',2,'navigating_to_start',false,auth.uid());
 if (a->>'applied')::boolean or (select revision from public.navigation_checkpoints)<>5 then raise exception 'Older update overwrote new state';end if;
 begin perform public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000004',gen_random_uuid(),'dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,'intro',false,auth.uid());raise exception 'Draft sync accepted';exception when insufficient_privilege then null;end;
 begin update public.navigation_checkpoints set revision=999;raise exception 'Direct mutation accepted';exception when insufficient_privilege then null;end;
 if (select count(*) from public.xp_ledger)<>0 then raise exception 'Checkpoint granted rewards';end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
 if (select count(*) from public.navigation_checkpoints)<>0 then raise exception 'Cross-user checkpoint leak';end if;
 begin perform public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000005','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',7,'intro',false,auth.uid());raise exception 'Cross-user session accepted';exception when insufficient_privilege then null;end;
 begin perform public.save_navigation_checkpoint('10000000-0000-4000-8000-000000000001','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,'navigating_to_start',false,auth.uid());raise exception 'Cross-user receipt accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.save_navigation_checkpoint(gen_random_uuid(),gen_random_uuid(),'cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,'intro',false,auth.uid());raise exception 'Anonymous RPC accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
\echo 'PASS: checkpoint authentication, private ownership, exact replay receipts, stale revision handling, draft rejection and zero XP grants'
