-- Synthetic schema only. Supabase auth functions and API roles MUST already exist.
CREATE ROLE phase24_auditor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA phase24_fixture;
REVOKE ALL ON SCHEMA phase24_fixture FROM PUBLIC;
GRANT USAGE ON SCHEMA phase24_fixture TO authenticated, anon, phase24_auditor;
CREATE TABLE phase24_fixture.documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  note text NOT NULL
);
ALTER TABLE phase24_fixture.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase24_fixture.documents FORCE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON phase24_fixture.documents TO authenticated;
GRANT SELECT ON phase24_fixture.documents TO anon, phase24_auditor;
CREATE POLICY owner_access ON phase24_fixture.documents TO authenticated
  USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE FUNCTION phase24_fixture.total_for_current_user() RETURNS bigint
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog
AS $$ SELECT coalesce(sum(amount_paise),0)::bigint FROM phase24_fixture.documents $$;
REVOKE ALL ON FUNCTION phase24_fixture.total_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION phase24_fixture.total_for_current_user() TO authenticated;
INSERT INTO phase24_fixture.documents(owner_id,amount_paise,note) VALUES
 ('11111111-1111-4111-8111-111111111111',101,'SYNTHETIC A'),
 ('22222222-2222-4222-8222-222222222222',202,'SYNTHETIC B');
