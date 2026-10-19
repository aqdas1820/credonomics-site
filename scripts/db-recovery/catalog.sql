-- Structural fingerprint. No table rows, account identities or credential values.
WITH objects AS (
 SELECT 'relation' AS kind, c.relname AS name,
   jsonb_build_object('owner',pg_get_userbyid(c.relowner),'acl',c.relacl::text,
     'kind',c.relkind,'rls',c.relrowsecurity,'force',c.relforcerowsecurity) AS detail
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=:'scope'
 UNION ALL
 SELECT 'column',c.relname||'.'||a.attname,
   jsonb_build_object('type',format_type(a.atttypid,a.atttypmod),'nullable',NOT a.attnotnull,
     'identity',a.attidentity,'generated',a.attgenerated,'default',pg_get_expr(d.adbin,d.adrelid))
 FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
 WHERE n.nspname=:'scope' AND a.attnum>0 AND NOT a.attisdropped
 UNION ALL
 SELECT 'constraint',c.relname||'.'||k.conname,jsonb_build_object('definition',pg_get_constraintdef(k.oid),'validated',k.convalidated)
 FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=:'scope'
 UNION ALL
 SELECT 'index',indexname,to_jsonb(indexdef) FROM pg_indexes WHERE schemaname=:'scope'
 UNION ALL
 SELECT 'policy',tablename||'.'||policyname,jsonb_build_object('roles',roles,'command',cmd,'permissive',permissive,'using',qual,'check',with_check)
 FROM pg_policies WHERE schemaname=:'scope'
 UNION ALL
 SELECT 'function',p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',
   jsonb_build_object('definition',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text)
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname=:'scope' AND p.prokind IN ('f','p')
 UNION ALL
 SELECT 'trigger',c.relname||'.'||t.tgname,to_jsonb(pg_get_triggerdef(t.oid))
 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname=:'scope' AND NOT t.tgisinternal
 UNION ALL
 SELECT 'schema',n.nspname,jsonb_build_object('owner',pg_get_userbyid(n.nspowner),'acl',n.nspacl::text)
 FROM pg_namespace n WHERE n.nspname=:'scope'
 UNION ALL
 SELECT 'enum',t.typname,jsonb_agg(e.enumlabel ORDER BY e.enumsortorder)
 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace JOIN pg_enum e ON e.enumtypid=t.oid
 WHERE n.nspname=:'scope' GROUP BY t.typname
)
SELECT coalesce(jsonb_agg(jsonb_build_array(kind,name,detail) ORDER BY kind,name),'[]'::jsonb)::text FROM objects;
