# Phase 22 — Verified staging connection and backup/restore preflight (read-only)

Date: 2026-10-18. CredoNomics Billing, strict additional INR 0.
Exact staging project: `jvpiulmcjjnsgozgqgzw` (`credonomics-staging`, CredoNomics Staging).
**Release remains NO-GO**. This report does NOT approve password reset, database migration, new database/project/branch, paid service, production merge or payment collection. Nothing in this file is a secret, dump, customer record or recovery key.

## Exact connected-source checks performed

- Supabase `get_project`: `ACTIVE_HEALTHY`, `ap-south-1` Mumbai, PostgreSQL `17.6.1.171`, host `db.jvpiulmcjjnsgozgqgzw.supabase.co`.
- Organization `get_organization`: Free / `tier_free`.
- Schema catalog: `public` 6 ordinary tables, `auth` 27, `storage` 8, `supabase_migrations` 1; `billing_private` **absent**.
- Database metadata: PostgreSQL `17.6`, `ssl=on`, maximum reported connections `60`, approximately **11 MB** current `postgres` database, **7** sessions at one inspection snapshot. Connection subjects included `authenticator` (PostgREST 14.18), `pgbouncer`, `postgres` management API and pg_net, Supabase services/scheduler/exporter and Storage API. This is **not** a complete external-client dependency inventory.
- The `public` tables `alerts`, `ipos`, `notifications`, `profiles`, `watchlist_items` and `watchlists` all have RLS enabled, with one or two policies each. Existing policies were not modified or asserted correct for billing.
- Catalog confirms **0** `billing_%` functions, **0** Storage buckets, **0** Storage objects. Bucket/object emptiness is only a current snapshot; Storage binaries are separate from a PostgreSQL dump if objects are added later.
- Existing Supabase migration registry: `20260902 cloud_accounts`, `20260928 atomic_alert_notifications`, `20260929 alert_engine_v2`, `20260930 alert_safety`. SQL `012`–`016` **not applied**.
- Installed DB extensions include `pgcrypto`, `uuid-ossp`, `supabase_vault`, `pg_stat_statements` and `plpgsql`. Presence of Vault does NOT establish that encrypted user secrets exist; the restore plan must assess whether any keys/configuration require separate recovery.
- Supabase security advisor flags `public.rls_auto_enable()` as executable by `anon`/`authenticated` while marked `SECURITY DEFINER`. Metadata shows return type `event_trigger` and it is attached to an event trigger. An advisor warning does not independently establish that a normal HTTP RPC call is exploitable; preserve the existing RLS-enablement mechanism pending focused review. No grants or triggers changed.
- Vercel project variable **names only** (no decrypted values) previously showed Supabase Data API credentials scoped to Preview but no identified `DATABASE_URL`/`PGPASSWORD` variables; absence of those names does NOT rule out local/third-party direct PostgreSQL clients.
- GitHub Draft PR #1 and [Phase 21 report](PHASE21_60_MIN_PRODUCTION_SPRINT_REPORT.md) reviewed; release manifest [ALL_AT_ONCE_RELEASE_GATES.json](ALL_AT_ONCE_RELEASE_GATES.json) retains **NO_GO, 2/13 verified, 11 blocked**. No staged billing source promoted to main.

## Actual credential/recovery blocker

The owner previously reported that no existing authorized PostgreSQL export password was located. The Supabase management connector's SQL access is **not** a transferable PostgreSQL export credential and is **not** a logical backup/restore proof. No credential store was searched, password rotated, Postgres login attempted, row data selected or remote database mutated.

Official connection guidance:
https://supabase.com/docs/guides/database/connecting-to-postgres

The **Connect** panel supplies the actual endpoint/host/port/username:
- Prefer **Direct** (PostgreSQL port 5432) for native `pg_dump` **if the Windows network supports IPv6**. Free direct connections are generally IPv6-only; do not buy an IPv4 add-on.
- Otherwise use the actual dashboard **Session pooler** IPv4 endpoint, also port 5432. Its host and username are not interchangeable with Direct and must not be guessed.
- Do **not** use Transaction pooler port 6543 for session-oriented native backups.
- Both modes require an **authorized database password**. A dashboard account, publishable/API/service-role token, or this management connector cannot be silently substituted for it.
- Require TLS and source project confirmation. The server's `ssl=on` metadata alone does not demonstrate client certificate/hostname validation.

## Safest zero-added-charge recovery approach after access exists

1. Reuse the previously verified **4 GiB VeraCrypt container** `D:\CredoNomics-Private-Backups\CredoNomics-Recovery.hc` mounted privately at **R:**. Prior same-machine synthetic dismount/remount and SHA-256 verification passed. Independently retain the passphrase. Validate R: availability, owner-only ACLs, free space and a separate protected device/offsite copy before introducing database records. Do not place plaintext dumps or scratch/restore directories on decrypted D:/C:, in Git, in CI, or in cloud sync.
2. Reuse installed **PostgreSQL 17 client/server tools** (previous Phase 20 verified portable version 17.11). An encrypted-file `pg_dump` custom-format export to R: is a useful **first snapshot**, but **it does not export cluster-wide roles**, all Supabase platform settings, external Auth/Storage binaries or all Vault/column-encryption keys. Where authorized, add a roles/grants/global inventory (`pg_dumpall --globals-only` may require privileges not granted to managed roles). Check migration history, custom objects in managed `auth`/`storage` and app extension dependencies separately. Use exact native client commands only after a locally configured private password source, tested TLS and privilege preflight.
3. The official **Supabase CLI** dump procedure provides Supabase-specific managed-schema filtering and separate **roles / schema / data** exports; **its CLI dump uses Docker**, which was not installed at earlier Windows preflight. Owner must independently authorize any Docker/WSL installation and confirm zero cost; do not install an addon/project/paid service automatically. Reference: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore and https://supabase.com/docs/guides/self-hosting/restore-from-platform.
4. For any export, direct `pg_dump` is individually snapshot-consistent, but separate roles/schema/data exports may span different transaction points. Record write-quiescence/snapshot consistency and integrity hashes, without leaking data into logs. Preserve the original encrypted export unchanged.
5. Restore into **a separately named disposable isolated local PostgreSQL 17** environment using only approved R:-encrypted temporary/data/log locations; disable outbound external integrations. A plain PostgreSQL restore does **not** fully simulate hosted Supabase Auth/PostgREST/Storage. Record object/table/grant/RLS/sequence and row-count comparisons; document any managed-role/extension failures as failures, not a successful restore. Confirm local auth/service limitations and original encrypted artifact re-decryptability.
6. Existing Storage inventory was 0/0; re-check at backup time. If any Storage objects exist, the database dump alone is insufficient for their bytes. Assess encryption key / Vault dependencies, recovery media, off-device copy and future retention. A one-drive container does not protect against D: drive failure.
7. **Only after complete encrypted backup and verified local restoration** request a separate explicit owner go/no-go for SQL `012`–`016` on exact ref `jvpiulmcjjnsgozgqgzw`. Do not execute migrations under this preflight task.

Supabase Free lacks the guaranteed downloadable/daily restore point for this workflow, so do not rely on dashboard automatic backups. https://supabase.com/docs/guides/platform/backups

## Exact Windows owner-only manual checklist (DO NOT SHARE SECRETS)

1. In **VeraCrypt**, privately confirm the exact container is mounted as **R:**. In Windows PowerShell use `Test-Path 'R:\Phase20-Synthetic-Recovery-Test.txt'` (expected **True** from prior synthetic drill) and `Get-PSDrive R` to confirm available space. If absent, mount via VeraCrypt privately; never type its passphrase into chat or Codex prompts. Retain a separately protected recoverable copy of the container on independent existing storage before real data export.
2. Open the [exact staging Dashboard](https://supabase.com/dashboard/project/jvpiulmcjjnsgozgqgzw), verify **credonomics-staging**, then click **Connect**. Check Direct versus Session pooler depending on IPv6 support. Record **only** the selected connection *mode* and nonsensitive host/port/user locally, never a password/whole connection URL in chat.
3. Original authorized administrator: check their own password manager/project setup record for the existing **database** password for this exact ref. If found, configure it **locally** in an approved owner-private encrypted libpq credential file/secure client prompt (no command arguments, code repo, CI, screenshots, chat or logs). If not found: **STOP**, report only `credential unavailable`; separately approve a dependency-audited rotation plan ([DATABASE_PASSWORD_ROTATION_IMPACT_PLAN.md](DATABASE_PASSWORD_ROTATION_IMPACT_PLAN.md)) before any reset.
4. Once credential is privately configured, ask Codex to report only **non-secret preflight booleans**: proper R: encryption/capacity, exact host/port/username, TLS/hostname verification, actual export privilege, local PG17 runtime, restore storage, additional off-device copy and safe backup methodology. Do not send credential or dump bytes. Only then conduct authorized private backup and isolated restore.

## Source-only progress while credential access is blocked

- Added `tests/staging/billing-postgrest-denial.spec.ts` (two **read-only, approval-gated** PostgREST negative cases) in commits `27867016c4981787acc02db8190b3f2098b991e5` and `005d42f95caf1cca880e27885d5b0c33d246571c`. These require exact-ref opt-in, exact `https://jvpiulmcjjnsgozgqgzw.supabase.co` API origin and privately supplied test keys/JWTs. Tests never write remote data, create users, call RPCs or make requests without the explicit opt-in. A valid ordinary-user JWT is checked before negative RLS results are considered; an unexposed private schema error is **API inaccessibility, not independent RLS evidence**.
- [CI #39127165018](https://github.com/aqdas1820/credonomics-site/actions/runs/39127165018) on code commit `005d42f95caf1cca880e27885d5b0c33d246571c`: source job **PASS**, `npm test` **272/272**, billing prebuild **200/200**, Next.js build, TypeScript and lint **PASS**; disposable PostgreSQL **19/19 PASS**; fail-closed launch checker **NO GO 2/13**; **six** staging Playwright tests listed, **none run remotely**. CI uses synthetic fixtures only; no Supabase credentials.
- Later live staging Auth/RLS, private bucket and PDF archive checks are still blocked by required backup/restore, separate migration permission and test-user approvals. No release manifest gates changed.

**Handoff:** waiting for existing authorized DB credential OR a separately approved reset decision after dependency inventory. No price changes, secret access, staging migration, payment, production branch merge or external messaging.
