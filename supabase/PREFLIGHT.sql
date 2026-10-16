-- Read-only inspection before applying a new application's schema to an existing project.
-- This must return no rows for a clean first installation. Do not drop existing objects.
select 'table' as object_type,schemaname as schema_name,tablename as object_name
from pg_tables
where (schemaname='public' and tablename in ('profiles','quests','quest_versions','quest_routes','assets','play_sessions','xp_ledger','offline_sync_operations'))
   or schemaname='wyldo_private'
union all
select 'view',schemaname,viewname from pg_views where schemaname='public' and viewname='quest_summaries'
union all
select 'schema',schema_name,schema_name from information_schema.schemata where schema_name='wyldo_private'
union all
select 'bucket','storage',id from storage.buckets where id='wyldo-quest-media'
union all
select 'trigger',trigger_schema,trigger_name from information_schema.triggers where trigger_name='wyldo_on_auth_user_created';
