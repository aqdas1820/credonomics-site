# Phase 24 — Offline database recovery validation

Date: 2026-10-19, Asia/Calcutta. **Release remains NO GO. Actual encrypted-backup
restore: NOT EXECUTED.** This report separates owner-provided backup state,
reproducible synthetic evidence and unresolved private prerequisites.

Dedicated branch: `codex/phase24-offline-db-recovery`. [Draft PR #5](https://github.com/aqdas1820/credonomics-site/pull/5)
is stacked on PR4's `codex/phase23-backup-integration`, not on `main`. PR4 remains
unmerged. Vercel preview deployment is disabled for the new branch. No hosted
Supabase, Railway, production or payment action was performed. No credential or
dump contents were inspected. Additional project spending: INR 0; CI uses only
standard GitHub-hosted runners for this public repository and synthetic fixtures.

## Evidence available and missing

The owner reports verified staging/production Railway exports, an independently
copied 4-GiB VeraCrypt container, four verified 1-GiB USB parts, a staging database
dump inside the vault and a failed earlier PG17 restore with missing Supabase
dependencies. These are accepted as owner-provided state; this phase does not
re-read token files, copy the vault or re-certify those media.

Read: Phase23 report, Railway operator runbook, Phase20 recovery validation,
Phase22 staging recovery preflight and Phase23 cross-account recovery notes.
Those reports describe earlier prerequisites but do **not** contain the exact
later failed restore statement/log. Bounded searches of the workspace's recovery
artifacts did not locate that PostgreSQL restore log. R: is currently **not
mounted** in this session. A private-path-only request for the previous logs and
dump-format/version notes was issued; no dump or raw log was requested in chat.

Local runtime inspection: no Docker/Podman/psql/pg_restore/Supabase CLI found on
PATH, no PostgreSQL installation found in the checked Program Files location,
and `wsl --list --quiet` reports WSL is not installed. These are genuine local
infrastructure blockers. The agent did not install a runtime, mount/decrypt the
vault, enable Windows features or obtain private credentials.

**Consequently the exact historical root cause, error order, dump scope,
extension list, role set, ACL completeness and backup consistency cannot yet be
independently established.** No error line or failed object name is invented.

## Diagnosis: supported facts versus hypotheses

| Dependency | What is established | What remains unknown for the original dump |
| --- | --- | --- |
| `auth` schema/functions | Application policies/FKs can depend on managed Auth objects absent in vanilla PostgreSQL. The pinned Supabase PG image supplies initial Auth objects; later `auth.jwt()` and helper updates are genuine GoTrue migrations. Initial synthetic harness readiness failed because it incorrectly expected the DB image alone to supply `auth.jwt()`. Official migration initialization replaces that assumption. | Whether original export excluded `auth`, failed its creation earlier, or expected managed DDL to pre-exist; exact first statement/error. |
| Roles/ownership/grants | A schema archive does not provision all cluster-global prerequisite roles. Missing custom role causes atomic restore failure; ownership, memberships, schema usage and function execute ACLs must be retained. | Original role names/attributes/memberships, missing-role errors, source role-only export and target operator privileges. |
| Extensions | Supabase PG image contains provider extension binaries; vanilla PG need not. Extension version, namespace, preload configuration and keys are dependencies, not just the extension name. | Exact source versions and whether errors concern unavailable binaries, absent prerequisites, permissions, or keys. |
| Schema ordering | Managed baseline and roles precede dependent application objects. Archive restore handles pre-data/data/post-data ordering; data-only cannot build missing relations. | Whether original restore used native custom archive, plain SQL, provider-filtered split files or a partial export; which phase failed first. |
| Duplicate objects | Full native dumps and provider-filtered dumps expect different target preparation. A full managed schema can collide with an initialized baseline. | Whether duplicate-object errors actually occurred. No `--clean`, SQL deletion or ignored-error workaround is proposed. |
| Auth/Storage version parity | DB major alone does not match GoTrue/Storage migrations, columns or custom managed-schema policies/triggers. | Source service migration versions and whether managed data/customizations are included. |
| Encryption/materials | Database restore cannot prove Storage object bytes, provider settings or Vault root-key recovery. | Whether the dump requires independent root keys or contains objects needing those services. |

The new classifier emits only fixed category counts and never matched SQL,
object identifiers, connection strings or COPY values. It aids diagnosis; counts
alone cannot establish causality. The operator must privately inspect the first
error and export plan before choosing the full-dump route.

## Implemented recovery strategy

`scripts/db-recovery/recovery.py` implements:

- Immutable official Supabase PG17 and GoTrue image references, with no implicit
  image pulls during restore. Complete official Auth migrations run **before any
  backup is loaded**, via the upstream `auth migrate` binary. No handwritten
  `auth.uid`, `auth.role` or `auth.jwt` substitute is installed.
- New UUID-labelled containers only, local Docker Unix/named-pipe endpoints,
  no remote engine overrides, no public ports or outbound network. Auth migration
  temporarily shares the DB's network-disabled namespace and connects only to
  its own loopback; it does not run an HTTP server.
- RAM-backed PGDATA and temp/log directories, bounded memory/no container swap,
  disabled WAL archiving/cron execution, no actual-dump bind mount, and no actual
  container log persistence. Host/VM memory protection remains an explicit
  operator prerequisite. **Synthetic-only** startup logs may be retained on the
  disposable CI runner to diagnose fixtures; real mode cannot select that path.
- Actual paths restricted to absolute, non-linked mounted R: paths; no CI actual
  restore; mandatory independent image/version/dependency/role review, input
  hashes, structural digest and counts covering every restored table. The
  supported actual mode is deliberately app-scoped; raw/full/unknown dumps and
  managed/key-dependent scopes fail closed.
- Archive TOC scope validation, strict extension version matching, reviewed
  application roles before archive restore, `--single-transaction --exit-on-error`,
  intact owner/ACL restore, no RLS/trigger/FK disabling, and before/after platform
  baseline comparison. Original input hashes are checked again after validation.
- Catalog verification includes schema/relation/function owners and ACLs,
  columns/types/defaults/identity, constraints, indexes, policies, RLS/FORCE flags,
  triggers and enum labels. It is a defined application-schema fingerprint,
  not a complete cross-version Supabase catalog equivalence theorem.
- Numbered private stdout/stderr diagnostics and `result.json` remain in a fresh
  R: workspace; failed attempts are never reused/overwritten. Cleanup checks
  UUID+run label/isolation before removing only owned containers, never prunes
  an existing Docker installation.

`Invoke-OfflineRecovery.ps1` provides Windows commands for Synthetic, ClassifyLog
and gated Restore modes. [The exact operator runbook](PHASE24_DATABASE_RECOVERY_RUNBOOK.md)
documents engine/image preparation, encrypted-memory/capacity checks, private
diagnostics, supported manifest, retries and full-Supabase review boundaries.

The actual mode does not promise that the existing staging dump is supported.
Its format and independent manifests are unavailable. No filtered replacement
dump was generated, no source objects omitted, no fake Auth functions added and
no source database contacted to fill evidence gaps.

## Tests and results

Local deterministic guard/diagnostic suite: **14 PASS**. Covers manifest/image
versions, unresolved dependencies, missing independent hashes, managed-schema
rejection, active/key-dependent extensions, strict counts, TOC scope rejection,
category-only diagnostics, R:-only paths and actual-restore denial in CI or
without attestations. The wrapper is syntax-checked separately.

The official-runtime CI fixture:

1. Initializes genuine Supabase roles/schema and complete GoTrue migrations in
   source and target; seeds two disposable UUID accounts and two synthetic rows.
2. Creates a table with FK to `auth.users`, identity sequence, positive-paise
   CHECK, explicit grants, FORCE RLS, owner-scoped USING/WITH CHECK policy and
   SECURITY INVOKER function with restricted EXECUTE.
3. Dumps application scope using real `pg_dump -Fc`; attempts data-before-schema,
   missing-role and missing-Auth restores and checks fail-fast atomic rollback.
   Separately verifies unavailable-extension and ordinary-role DDL denial.
4. Provisions the required custom role, restores correctly, compares catalog and
   unchanged platform helper/role/extension baseline, checks row total/amount
   and identity-sequence continuation.
5. Runs ten SQL RLS assertions across source and restored target: two distinct
   users see their own amounts, anonymous sees zero, cross-owner reassignment
   fails WITH CHECK, and anonymous function execution is denied.

These SQL claims test the real helper/RLS functions; they are **not JWT signature
validation or Auth/PostgREST HTTP E2E**. No original user identity, financial row,
hosted credential or encrypted backup enters this workflow.

Initial CI failures are retained as evidence, not hidden: runs
[39220033542](https://github.com/aqdas1820/credonomics-site/actions/runs/39220033542),
[39220260854](https://github.com/aqdas1820/credonomics-site/actions/runs/39220260854),
and [39220573729](https://github.com/aqdas1820/credonomics-site/actions/runs/39220573729)
failed at the incorrect DB-image-only Auth readiness prerequisite. Synthetic
startup diagnostics confirmed PostgreSQL 17.6 itself reached ready state;
the later Auth migration baseline was missing. The corrected complete-migration
run and final exact-source results are recorded below after completion.

The normal application/TypeScript/build source is unchanged by this phase; its
previous green exact-head evidence remains in Phase23. New SQL and Python checks
use a separate workflow and no existing billing role shim. Actual private dump
restore and local Docker round-trip remain NOT EXECUTED in this workstation.

## Remaining manual steps and release blockers

1. Owner mounts the already verified vault and provides exact private log and
   version/format-note paths. Run category-only diagnostics, then inspect the
   first failure privately. Do not share raw contents or credentials.
2. Independently confirm actual format/scope, source tool/PG/Auth/Storage versions,
   extension/role/ACL dependencies, counts/catalog baseline and key requirements.
   A complete native dump and a provider-filtered roles/schema/data export need
   different target preparation; choose after inspection, not by guess.
3. An authorized local operator installs/enables an eligible free runtime if
   needed, verifies memory/swap protection, caches exact images and rehearses the
   synthetic procedure. This is a local infrastructure boundary, not a hosted
   change request. No spending or paid workaround is authorized.
4. If the actual dump matches the supported application-only contract, approve
   that exact private manifest and run a fresh isolated attempt. Otherwise follow
   the full-recovery compatibility review in the runbook; do not change manifest
   labels or skip objects to force acceptance. Unknown/full backups remain blocked.
5. Preserve private hashes/logs/results, validate recovered scope independently,
   then separately plan full Auth/Storage/API and encryption-key recovery with
   synthetic accounts and services isolated from external providers. A scoped
   restore PASS does not resolve full recovery or production approval.

Release gates still blocked: actual complete DB restore, hosted Auth/RLS and
archive retention/recovery, lawful issuer/privacy configuration, independent
bank-credit/receipt E2E, WhatsApp server OTP/delivery, YouPI licensing/upstream
security, merchant beneficiary/order binding and sustainable INR0 streaming.
Source fixtures cannot upgrade those gates. No launch manifest gate was changed.

## Primary sources reviewed

- [Supabase restore guide](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
  and [CLI backup/restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore):
  managed baseline, role/schema/data and extension/version considerations.
- [Upstream Auth migration command](https://github.com/supabase/auth/blob/ce9a8eee0cc042be8c7a42981a7ddae631e41d91/cmd/migrate_cmd.go)
  and [genuine `auth.jwt` migration](https://github.com/supabase/auth/blob/ce9a8eee0cc042be8c7a42981a7ddae631e41d91/migrations/20220531120530_add_auth_jwt_function.up.sql).
- [PostgreSQL 17 pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html):
  ownership/privileges, archive ordering, atomic and error-stop behavior.
- [Supabase changelog](https://supabase.com/changelog) and
  [PG17 self-hosting guidance](https://supabase.com/docs/guides/self-hosting/postgres-upgrade-17).
  The markdown changelog endpoint failed; HTML was used. No hosted API queried.
