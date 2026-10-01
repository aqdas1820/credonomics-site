-- Read-only catalog verification. Execute only with an explicit, verified staging ref.
begin read only;
select jsonb_build_object(
  'migrations', (select jsonb_agg(version order by version) from supabase_migrations.schema_migrations),
  'tables', (select jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
  'policies', (select jsonb_agg(to_jsonb(p) order by tablename,policyname) from pg_policies p where schemaname='public'),
  'indexes', (select jsonb_agg(to_jsonb(i) order by indexname) from pg_indexes i where schemaname='public'),
  'constraints', (select jsonb_agg(jsonb_build_object('table',c.conrelid::regclass::text,'name',c.conname,'definition',pg_get_constraintdef(c.oid)) order by c.conname) from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public'),
  'functions', (select jsonb_agg(jsonb_build_object('name',p.proname,'definition',pg_get_functiondef(p.oid),'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('handle_new_user','trigger_price_alert','trigger_alert_v2')),
  'triggers', (select jsonb_agg(jsonb_build_object('name',t.tgname,'enabled',t.tgenabled,'definition',pg_get_triggerdef(t.oid))) from pg_trigger t where not t.tgisinternal and t.tgname='on_auth_user_created'),
  'notification_update_columns', (select jsonb_agg(column_name order by column_name) from information_schema.columns where table_schema='public' and table_name='notifications' and has_column_privilege('authenticated','public.notifications',column_name,'UPDATE')),
  'enums', (select coalesce(jsonb_agg(t.typname),'[]'::jsonb) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'),
  'counts', jsonb_build_object('auth_users',(select count(*) from auth.users),'profiles',(select count(*) from public.profiles),'watchlists',(select count(*) from public.watchlists),'watchlist_items',(select count(*) from public.watchlist_items),'alerts',(select count(*) from public.alerts),'notifications',(select count(*) from public.notifications),'ipos',(select count(*) from public.ipos))
) as verification;
commit;
