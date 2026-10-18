-- PREPARED ONLY: owner-reviewed exact-project read-only catalog check after migration approval.
-- Does not validate project identity: operator must first independently verify dashboard ref.
-- No customer-table reads, role creation, grants, DDL or migrations. Output is booleans only.
-- Inaccessibility and enabled RLS do NOT prove row-policy behavior with real Auth sessions.
begin read only;
with expected(name) as (values
  ('invoices'), ('invoice_lines'), ('bank_credit_evidence'),
  ('receipts'), ('audit_events'), ('youpi_observations')
), relations as (
  select e.name, c.oid, c.relrowsecurity from expected e
  left join pg_namespace n on n.nspname = 'billing_private'
  left join pg_class c on c.relnamespace = n.oid and c.relname = e.name and c.relkind = 'r'
), identities as (
  select oid from pg_roles where rolname in ('anon', 'authenticated')
)
select
  (select count(*) = 6 from relations where oid is not null) as all_six_tables_exist,
  (select count(*) = 6 from relations where relrowsecurity) as all_six_have_rls_enabled,
  (select count(*) = 2 from identities) as api_roles_exist,
  not exists (
    select 1 from identities r, pg_namespace n
    where n.nspname = 'billing_private' and has_schema_privilege(r.oid, n.oid, 'USAGE')
  ) as api_roles_cannot_use_private_schema,
  not exists (
    select 1 from identities r, relations t where t.oid is not null and
      (has_table_privilege(r.oid, t.oid, 'SELECT') or has_table_privilege(r.oid, t.oid, 'INSERT')
       or has_table_privilege(r.oid, t.oid, 'UPDATE') or has_table_privilege(r.oid, t.oid, 'DELETE'))
  ) as api_roles_have_no_direct_table_access,
  not exists (
    select 1 from identities r, pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and starts_with(p.proname, 'billing_')
      and has_function_privilege(r.oid, p.oid, 'EXECUTE')
  ) as api_roles_cannot_execute_billing_rpcs;
rollback;
