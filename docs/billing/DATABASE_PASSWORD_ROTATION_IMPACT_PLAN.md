# Staging database password rotation impact plan — NOT AUTHORIZED / NOT EXECUTED

2026-10-18. Exact project: `credonomics-staging`, `jvpiulmcjjnsgozgqgzw`.
Additional spend ceiling: INR 0. This document grants no reset, user creation,
permission change, migration, deployment or production access approval.

Existing export password remains unavailable. Keep backup/restore blocked. The
owner must choose between privately recovering an existing authorized credential
and a separately approved controlled rotation. Do not interpret a request for a
plan as permission to reset. [Official PostgreSQL role guidance](https://supabase.com/docs/guides/database/postgres/roles),
[connection methods](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Impact inventory before requesting an execution window

The owner/operator must inventory **consumers, locations and responsible owners**,
never credential values. No inventory of private stores was performed by this task.

| Consumer | Expected impact / required action |
| --- | --- |
| Direct PostgreSQL sessions and shared session pooler | New authentication with the old database password can fail. Inventory desktop clients, tools, scripts and connection pools; plan controlled reconnects. Existing sessions must not be assumed revoked merely by changing a password. |
| CLI, local export tools, pgpass/service files | Replace only the authorized exact-project entry privately on encrypted storage; enforce precise host/port/database/user binding, ACLs and TLS verification. No secrets in arguments, history or reports. |
| CI/CD, scheduled jobs, linked integrations | Identify any direct-database secret references without reading/printing values. Pause affected jobs with separate authorization and assign private updates to their owners. Never put staging exports into GitHub Actions. |
| App using Supabase HTTP APIs / Auth / Storage | A PostgreSQL password is distinct from a service-role/API key, Auth user's password or JWT signing key. Do not rotate unrelated secrets automatically. Confirm actual architecture and provider-managed connections; do not assume either universal outage or universal immunity. |
| Runtime using a database URL | Requires a separately approved runtime secret update/restart if it embeds the changed password. No production environment edit or deployment is authorized here. |
| Recovery and rollback | There is no verified database backup and no known old password. Document this risk before approval. Do not promise rollback to an unavailable credential. Prefer a controlled forward fix using the new authorized credential; another reset is another explicit owner decision. |

## Concrete execution plan for a later, separately approved operator

1. Confirm exact project/name/organization/Free status again and verify operator
   role. Record non-sensitive inventory completion and a no-cost maintenance window.
   Keep all billing/payment/OTP flags off. Inventory non-billing dependents too.
2. Privately generate/store the replacement credential in an existing owner vault;
   independently recover its encrypted copy. Arrange dependent-owner updates before
   changing anything. Do not send a credential to this agent/chat.
3. Obtain explicit owner approval naming the exact reference, PostgreSQL role,
   reset action, expected reconnect interruption, dependent secret updates,
   authorized operator, execution window and contingency. Approval for backup,
   VeraCrypt setup or this plan is insufficient. Stop if dependencies are unknown.
4. Only the approved operator would use the official dashboard reset mechanism
   privately. Do not create a new role, broaden grants, disable network controls,
   purchase IPv4, create a branch/project or run SQL migrations as a workaround.
5. Update inventoried consumers privately and reconnect as needed. Verify the new
   connection with certificate/hostname validation, exact-project binding and
   non-mutating queries; verify sufficient export access without dumping data.
   Test expected old-password denial using an approved controlled method that
   does not expose it. Report booleans and exit codes only.
6. Check affected application health without live payments/customer messages.
   Do not replace unrelated API/JWT/OTP/YouPI keys to resolve an unrelated error.
   If a critical dependent fails, hold feature activation and follow the agreed
   forward-recovery procedure; never improvise another reset or production deploy.
7. Only after separate backup preflight passes may the authorized private logical
   backup/local restore proceed. Keep migrations 012–016 blocked until tested
   recovery, reviewed rollback and separate exact-ref migration approval.

## Stop criteria and audit record

Stop for wrong project, unknown dependents, missing explicit approval, insecure
secret destination, unavailable independent recovery, unplanned spend, excessive
permissions or failure to reconnect. No hard-coded downtime or automatic session
revocation guarantee is made. Audit only timestamp, exact project, responsible
operator role, approved action reference, affected consumer categories, sanitized
connection/health outcomes and next blockers. Never store credentials or customer
records in this document. **Execution status: NOT RUN.**


## 2026-10-18 addendum: actual failed owner login and compromised-candidate response

**Owner report (not re-tested here):** VeraCrypt R: mounted with 3.98 GB available, PostgreSQL 17.11 client operational, Direct IPv6 endpoint/port 5432 reached PostgreSQL at least once, which returned `FATAL: password authentication failed for user "postgres"`. Some later attempts timed out. This does **not** prove an authenticated export, and a timeout must not be interpreted as a valid or invalid credential.

The previously shared candidate credential appeared in a separate ChatGPT conversation. Its secret value was not copied, searched, requested, tested or put in this repository. **Treat it as exposed if valid anywhere**; stop retrying or reusing it, and arrange authorized replacement for any separately identified service where it is active. A new staging PostgreSQL password must be distinct and privately recoverable. A public report alone cannot confirm where a candidate password is reused.

### Exact live read-only inventory

Connected Supabase `get_project` and `get_organization` still show `credonomics-staging`, exact ref `jvpiulmcjjnsgozgqgzw`, Free, `ACTIVE_HEALTHY`, ap-south-1, PostgreSQL 17.6.

At the inspection snapshot, `pg_stat_activity` had 7 sessions: `authenticator`/PostgREST, `pgbouncer`, `postgres`/management API, `postgres`/pg_net, `supabase_admin`/pg_cron, `supabase_admin`/exporter, and `supabase_storage_admin`/Storage API. This **does not show all brief external sessions** and cannot establish that a reset would be outage-free.

Catalog summary: ~11 MB existing DB; `auth` 27, `storage` 8, `public` 6 and `supabase_migrations` 1 ordinary tables; `billing_private` absent; billing RPCs 0; current Storage buckets and objects 0. Existing non-billing application data and dependencies must be preserved.

Inspected Vercel environment variable **names only**, never their values. The `credonomics-site` Preview environment uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus exact-project staging identity flags; no explicit `DATABASE_URL`, `PGPASSWORD`, `PGHOST` key found. The Production environment had one unrelated analytics token name in the returned inventory. No claim is made that no other external DB consumers exist.

Reviewed active GitHub feature source: Supabase website client uses `@supabase/supabase-js` / `@supabase/ssr` HTTP API credentials, not a direct database `postgres` password; the billing PostgreSQL CI job has a fixed **synthetic local** test password, not a Supabase staging password. Five scheduled GitHub workflows and Vercel cron exist; their code/secret references and independent owner environments need full inventory before rotation. GitHub Actions secret-name API was not available through the connected public fetch interface. Those names were **not** inspected. No secret values were read.

Supabase security advisor separately flagged existing `public.rls_auto_enable()` SECURITY DEFINER function EXECUTE grants to anon/authenticated; this is not itself evidence of a database-password dependency. This report authorizes no grants/DDL changes. Advisor remediation: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable .

### Owner-only preapproval actions (short checklist)

1. **Stop password guessing.** Open https://supabase.com/dashboard/project/jvpiulmcjjnsgozgqgzw and confirm exact name/ref. Do not share the exposed candidate with this agent, Codex, chats, files, tickets, logs, screenshots or GitHub.
2. **Finish dependency inventory without reading credentials:** ask owners of Windows pgAdmin/psql scripts, scheduled jobs, GitHub Actions secrets (names only), other Vercel projects, private workers, integrations and third-party clients whether they authenticate as `postgres` to this exact project. Mark each as `uses postgres password: yes/no/unknown` plus who would update it. Stop if any critical dependency remains `unknown`.
3. **Privately generate a unique replacement** and save it in an approved secure password manager; test that a second authorized recovery path works. Confirm the existing VeraCrypt R: mount and independent protected/off-device container recovery; this is for *subsequent backup*, not proof of recovered DB data.
4. Choose an owner-attended maintenance window and document affected consumers, how to update private credentials, how to confirm their health, and forward-recovery contacts. Then obtain **separate explicit approval** naming `credonomics-staging` ref `jvpiulmcjjnsgozgqgzw`, role `postgres`, **dashboard password reset**, expected possible reconnect interruption, window and responsible owner. General permission to prepare for production is not a substitute.

### Postapproval execution (NOT AUTHORIZED by this document)

1. Freeze or coordinate only inventoried password-bound workers/applications under their owners' explicit authorization; leave every billing/payment/OTP flag disabled. Avoid repeatedly retrying the compromised/invalid candidate, which may trigger Supavisor rate-limiting/circuit-breaker behavior if the shared pooler is used.
2. An authorized owner signs in to the **exact** https://supabase.com/dashboard/project/jvpiulmcjjnsgozgqgzw/database/settings dashboard, finds the database password reset control in **Database Settings**, and performs **one** reset using the privately stored new strong password. Do not change unrelated API keys, JWT signing secrets, Auth account passwords or provider secrets, and do not touch another Supabase project.
3. Update inventoried external password-bound clients **privately** and reconnect them. Supabase manages passwords for built-in platform services; clients embedding `postgres` credentials must be updated. If shared-pooler logins briefly report SQLSTATE `28P01` immediately after rotation, check the new password through the correct Direct TLS endpoint, then perform controlled pooler reconnect after the documented cache delay. Do not reset repeatedly; pause misconfigured retry loops. See https://supabase.com/docs/guides/troubleshooting/supavisor-error-password-authentication-failed-after-password-rotation .
4. Owner performs a **read-only, TLS hostname-verified** `psql` connection to the exact Direct IPv6 endpoint `db.jvpiulmcjjnsgozgqgzw.supabase.co` port `5432`, user `postgres`, database `postgres`, using an interactive password prompt or approved private credential manager, **never a URL/argument containing the password**. Obtain the verified root CA/certificate as specified in Supabase **Connect / Database SSL settings**. Required client option is `sslmode=verify-full` and the correct `sslrootcert`; merely reporting server `ssl=on` is insufficient. Only run metadata queries such as `select current_database(), current_user, current_setting('server_version')`; no data reads or writes are approved by this plan.
5. Verify Preview Supabase HTTP API/Authentications stay healthy under existing API credentials; inspect affected independent workers only within their owners' authorization. Record **booleans and non-secret app/role labels only**. Stop if reconnect or health checks fail, without improvising further reset or app deployment.

### Then, and only then, the encrypted backup/isolated restore path

- Before export, independently verify R: is the actual VeraCrypt-mounted `CredoNomics-Recovery.hc` vault, has sufficient encrypted capacity, the passphrase/recovery is independently recoverable, protected ACLs apply and an **off-device protected copy** exists. Do not write an unencrypted dump to Windows C:/D:, Docker's unencrypted data directory, GitHub, CI or cloud sync.
- Use the correct, verified Direct connection (or exact dashboard **Session pooler** port 5432 if IPv6 is genuinely unreliable). **Do not** use transaction pooler port 6543 for backup. PostgreSQL 17.11 client already exists; verify actual client command and TLS before proceeding.
- Plan a **private, snapshot-consistent logical export** to R: with appropriate privileges and safely separated roles/schema/data/migrations/custom Auth/storage configuration. Supabase's official CLI applies managed-schema filtering and normally runs via Docker; Docker availability, encrypted Docker scratch storage and compatibility must be verified **before** considering it. A raw `pg_dump` custom-format snapshot is not a complete hosted Supabase recovery by itself.
- Check Storage object bytes separately (current 0/0 is only a prior snapshot), custom roles, JWT/OAuth/SMTP/provider settings, extensions and any Vault key material required for realistic recovery, without exporting secrets into PR logs. The local restore must be to an isolated, disposable **local** PostgreSQL/Supabase runtime whose data/temp/logs reside on approved encrypted storage; it must never overwrite staging. Compare non-sensitive schema/object/row counts, role/RLS privileges, application reads and stable hashes; document any managed service limitations honestly.
- Only mark `free_recovery` VERIFIED after original encrypted artifact survival, an independently restored copy and a tested rollback procedure. Billing SQL `012`–`016` on staging still requires **another** explicit approval after this proof.

**As of this addendum:** password reset NOT RUN, authenticated `postgres` export NOT RUN, database backup/restore NOT RUN, migrations NOT RUN, production main/payment operations NOT RUN; spending INR 0.
