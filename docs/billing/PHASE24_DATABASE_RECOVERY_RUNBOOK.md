# Phase 24 offline database recovery operator procedure

Use only a private local session. No hosted connection strings, live credentials,
CLI link/reset/start against an existing project, Railway commands, deployment,
or payment activation are needed. Never put actual dump bytes, SQL diagnostics,
row counts, source manifests, role passwords or restored PGDATA into Git/CI/chat.

## Prerequisites and stop conditions

1. The original encrypted vault must already be mounted as **R:** by its owner.
   Keep the verified SSD/USB copies disconnected or read-only during validation.
   Verify the original dump SHA-256 against the independently retained inventory.
   Do not overwrite, filter, edit, split differently, or restore into the dump.
2. Python 3.11+ and an approved, already-installed **local Linux Docker engine**
   are required. An administrator may need to install/enable virtualization/WSL
   and Docker, but this agent does not do so. Confirm eligibility for a zero-cost
   engine/license and sufficient existing host capacity; buy nothing. Engine
   endpoint must be local Unix socket or Windows named pipe, not TCP/SSH/cloud.
3. The official immutable image must be cached before the private phase. It is
   approximately a substantial software download; confirm existing disk/network
   allowance. No actual dump is used during image download or synthetic CI.
4. Actual restore uses RAM-backed PGDATA (1 GiB) with a 2 GiB container limit,
   no container swap, no network, no published ports, no host bind mounts and no
   persisted Docker logs. **Host/VM swap, pagefile, hibernation and crash dumps
   must also be disabled or encrypted under approved custody**. The container
   flag alone does not protect host memory. `-HostMemoryProtected` is an operator
   attestation, not something the tool can establish. Stop if this is unknown.
5. Do not use this 1-GiB RAM profile for a larger restored database or assume a
   4-GiB vault has enough free capacity. Review estimated restored size, indexes,
   temporary work, diagnostics and host headroom first. A capacity failure is
   BLOCKED, never an invitation to write plaintext into Docker Desktop's disk.
6. Only the deliberately narrow **reviewed application-scoped custom archive**
   route below is implemented automatically. A raw complete/unknown dump, managed
   Auth/Storage data, active cron/net jobs, platform roles, unsupported extensions,
   Vault/pgsodium keys or unmatched service migrations need a separate reviewed
   full Supabase plan. **Do not relabel a full dump to bypass this gate.**

The current agent session has no mounted R:, Docker, psql or installed WSL.
The previous restore logs and actual dump format were not available to inspect.
Run none of the private steps until those prerequisites are resolved locally.

## 1. Verify tools and cache the exact public image

From the repository root, in Windows PowerShell:

```powershell
python --version
docker version
if ($LASTEXITCODE -ne 0) { throw 'Local Docker unavailable' }
docker context inspect
if ($LASTEXITCODE -ne 0) { throw 'Docker context inspection failed' }
# Inspect privately: endpoint must be npipe local Windows or unix:///var/run/docker.sock.
# No DOCKER_HOST / DOCKER_CONTEXT / TLS endpoint overrides are permitted by the harness.
$Image = 'supabase/postgres:17.6.1.136@sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00'
$AuthImage = 'supabase/gotrue:v2.197.0@sha256:1736a63078f5922b198c4cbe50f80ab9a2d3b54fe8b7b6cfb2e9dc5dbbc12c6b'
docker pull $Image
if ($LASTEXITCODE -ne 0) { throw 'Pinned public image cache failed' }
docker pull $AuthImage
if ($LASTEXITCODE -ne 0) { throw 'Pinned authentic Auth migration image cache failed' }
docker image inspect $Image
if ($LASTEXITCODE -ne 0) { throw 'Image verification failed' }
```

The image version comes from official Supabase self-hosting configuration and
is pinned by registry digest. This establishes a genuine baseline for synthetic
tests, **not compatibility with the uninspected staging backup**. If its source
image/extension/Auth/Storage versions differ, stop for compatibility review.
The restore harness always uses `--pull=never`; no downloads occur during restore.
The official GoTrue binary applies its complete embedded migration chain before
any backup is loaded. It shares only the DB container's isolated loopback
namespace, runs `auth migrate`, and exits; it never starts an Auth HTTP server.
The Postgres image alone does not install the later `auth.jwt()` migration.

## 2. Reproduce the synthetic recovery first

```powershell
python -m unittest discover -s scripts/db-recovery -p 'test_*.py' -v
if ($LASTEXITCODE -ne 0) { throw 'Guard tests failed' }
powershell -NoProfile -File scripts/db-recovery/Invoke-OfflineRecovery.ps1 -Mode Synthetic
if ($LASTEXITCODE -ne 0) { throw 'Supabase synthetic round trip failed' }
```

These commands use disposable **synthetic-only** fixtures in the normal local
temp directory. They must never be adapted to read the encrypted backup. The
database image supplies `auth.uid()`, `auth.role()` and `auth.jwt()`; the test
does not define or replace them. The two UUID fixtures are not real users.
Expected result is JSON with `synthetic: PASS`, matching catalog, unchanged
platform baseline, ten SQL RLS assertions, row/sequence checks and negative
dependency checks. No network/ports are available to either database container.

Claims set in SQL test the real database helper and RLS semantics, **not a JWT
signature, hosted Auth login, PostgREST role-switching or authorization service**.
Do not promote this result to end-to-end Auth recovery.

## 3. Diagnose the original failure without publishing it

After the owner mounts the verified vault, supply the exact log path privately:

```powershell
powershell -NoProfile -File scripts/db-recovery/Invoke-OfflineRecovery.ps1 `
  -Mode ClassifyLog -Log 'R:\<existing-private-restore-log>' -VaultConfirmed
if ($LASTEXITCODE -ne 0) { throw 'Log classification incomplete' }
```

Only category counts print. Review the original log privately: the **first**
error and the exact preceding statement determine the root cause. Later missing
relations/grants may be cascades. Preserve the source log and its hash. Do not
paste `CONTEXT`, COPY rows, function bodies or connection URIs into an issue.

| Error category | Correct investigation / resolution |
| --- | --- |
| Missing `auth` schema / `auth.uid`, `auth.jwt`, `auth.role` | Determine whether the export excluded managed DDL and expected a preinitialized Supabase target. Use authentic matching platform schema/migrations or a genuinely complete original export. Never add a stub returning a fixed UUID/NULL. |
| Missing roles | Compare roles, memberships, ownership, LOGIN, INHERIT, SUPERUSER, BYPASSRLS and function/schema grants against export-time metadata. Genuine image defines platform API roles; restore reviewed custom roles before app objects. Never grant blanket superuser/bypassrls to resolve a denial. |
| Extension unavailable | Match source extension **version, namespace, binaries, preload requirements and encryption keys**. Base `postgres:17` does not contain every Supabase extension. Do not silently drop extension objects. |
| Duplicate managed objects | A full native dump is colliding with an initialized target. Do not use `--clean` or ignore errors against the initialized database. Choose a reviewed empty-database full-export route or provider-filtered split route; these are different formats. |
| Missing relations / FK failures | Confirm pre-data/schema before data and post-data constraints, target baseline and referenced Auth rows. A schema-scoped dump may omit cross-schema dependencies. Do not disable FK validation to conceal missing rows. |
| Privilege/owner denial | Restore the intended owner role and explicit grants in an isolated target with the authorized local restore principal. `--no-owner`/`--no-acl` would discard semantics and cannot certify recovery. |
| Version/header/settings mismatch | Match the source PostgreSQL major, pg_dump/pg_restore compatibility, Auth/Storage migrations and extensions. Do not delete unknown columns or COPY sections just to obtain exit 0. |

For a custom archive, an existing approved PostgreSQL 17 client can list its TOC
without restoring. Save **both** streams in R:, never to the console:

```powershell
$PgRestore = '<existing-approved-PG17-bin>\pg_restore.exe'
$Dump = 'R:\<original-staging-backup>'
$Toc = 'R:\<new-private-diagnostic-directory>\archive-toc.txt'
$TocError = 'R:\<new-private-diagnostic-directory>\archive-toc.stderr.txt'
if ((Test-Path -LiteralPath $Toc) -or (Test-Path -LiteralPath $TocError)) { throw 'Refusing diagnostic overwrite' }
& $PgRestore --list $Dump 1> $Toc 2> $TocError
if ($LASTEXITCODE -ne 0) { throw 'Not a readable custom archive; inspect private diagnostics and format notes' }
```

This uses text redirection only. **Never** pipe a binary dump through Windows
PowerShell's text pipeline. Plain SQL needs `psql -X -v ON_ERROR_STOP=1`, not
`pg_restore`; do not execute it before the format/dependency plan is approved.

## 4. Build the independent private compatibility manifest

Do not derive expected counts/catalog hashes from the same restored target you
are trying to certify. Retain export-time/source-reviewed evidence separately.
If these artifacts are missing, record evidence as missing; do not invent values
or access hosted services to obtain them as part of this offline assignment.

For the supported app-only route, create a private JSON manifest on R: with:

```json
{
  "schemaVersion": 1,
  "format": "app-scoped-custom-archive",
  "sourcePostgresMajor": 17,
  "image": "supabase/postgres:17.6.1.136@sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00",
  "authImage": "supabase/gotrue:v2.197.0@sha256:1736a63078f5922b198c4cbe50f80ab9a2d3b54fe8b7b6cfb2e9dc5dbbc12c6b",
  "scope": "<dedicated reviewed app schema>",
  "archive": "R:\\<original-app-only-custom-archive>",
  "archiveSha256": "<64 lowercase hex digits from independent inventory>",
  "roles": "R:\\<reviewed-app-only-roles.sql>",
  "rolesSha256": "<64 lowercase hex digits from independent inventory>",
  "rolesReviewedAppOnly": true,
  "expectedCatalogSha256": "<independently retained canonical catalog digest>",
  "extensions": { "pgcrypto": "<exact source version>" },
  "expectedCounts": { "<table>": 0 },
  "externalDependenciesReviewed": true,
  "managedSchemaDataRequired": false,
  "encryptionRootKeyRequired": false
}
```

All placeholders need real private evidence. The zero count is illustrative,
not an assertion about the dump. `catalog.sql` defines the canonical structural
snapshot: relation/schema/function owners and ACLs, types/defaults/identity,
constraints/indexes, policies, RLS/FORCE flags, triggers and enum labels.
The harness hashes the UTF-8 JSON output after trimming outer whitespace. Keep
the source snapshot's encoding/canonicalization compatible; PowerShell 5.1 text
redirection may be UTF-16 and is **not** a matching canonical byte representation.
Custom roles SQL must be reviewed for exact role privileges/memberships and must
not redefine managed roles/functions, contain external commands or copy live
passwords. No SQL rewrite engine or global-role reconciliation is provided.

`public`, `auth`, `storage`, platform schemas and active/key-dependent extensions
are intentionally rejected by this app-only procedure. If the existing dump is
full/raw or includes these objects, proceed to the full-recovery review below.

## 5. Run one approved application-scoped restore attempt

Only after all prerequisites and independent review:

```powershell
powershell -NoProfile -File scripts/db-recovery/Invoke-OfflineRecovery.ps1 `
  -Mode Restore -Manifest 'R:\<reviewed-private-manifest.json>' `
  -Workspace 'R:\<fresh-phase24-attempt-directory>' `
  -VaultConfirmed -HostMemoryProtected -AuthorizeLocalRestore
if ($LASTEXITCODE -ne 0) { throw 'Restore BLOCKED/FAILED; preserve private diagnostics' }
```

Each attempt requires a **new nonexistent workspace**. The harness verifies input
hashes, local engine/image identity and isolation; starts a fresh RAM-backed
database; checks genuine Supabase baseline; validates the archive TOC scope;
checks required installed extension versions; restores reviewed roles, then
the archive with owners/ACLs intact, `--single-transaction --exit-on-error`.
It compares the structural digest, platform baseline and independent row counts,
then rechecks input hashes. It never sets `session_replication_role=replica`,
disables RLS/triggers, or discards failed SQL. If real triggers prevent import,
stop for a separate reviewed provider restore strategy rather than weakening them.

Success writes `result.json` inside R:. It certifies only the named application
scope, with `fullSupabaseRecovery: NOT_VERIFIED` and `authHttpE2E: NOT_RUN`.
Failure prints no raw error text; inspect numbered private stdout/stderr files.
The original archive/roles remain unchanged. Owned UUID+label containers are
removed even on failure; no Docker prune or existing project cleanup is run.

If interrupted before cleanup, identify only names `cn-phase24-<UUID>` in the
attempt's private Docker inspection output, verify the `org.credonomics.phase24`
run label and no bind mounts, then manually `docker rm -f -v <exact-name>` after
review. Do not remove other containers/volumes. A retry starts fresh; it must not
resume a partially restored database or overwrite earlier evidence.

## Full Supabase backup: mandatory review before execution

The current backup's format and logs are unavailable to this agent. Consequently
there is no authorized executable full-dump command for this particular file yet.
The supported next sequence is:

1. Privately identify native full `pg_dump` custom/plain vs Supabase CLI filtered
   roles/schema/data exports; retain tool/source versions and export scope.
2. Inventory exact source roles, extension versions/namespaces, auth/storage DDL
   and migration versions, app dependencies, grants/default privileges, policies,
   auth rows/custom triggers, object counts and encryption-key requirements.
3. For provider-filtered split exports, initialize **matching authentic** Supabase
   database plus Auth/Storage migrations first, with no external providers,
   SMTP, cron, webhook dispatch or exposed network. Restore reviewed roles →
   schema → data → custom managed-schema objects. The DB image alone may contain
   only an older baseline of Auth/Storage tables; it is not full service parity.
4. For a genuinely complete native dump, plan a separate empty database within
   a disposable compatible runtime, with exact prerequisite roles/extensions,
   restoring the dump's own genuine auth DDL. Do not collide full managed DDL
   with the initialized platform baseline or use `--clean` indiscriminately.
5. Use atomic fail-fast restore where the format supports it, then verify no
   ignored errors, complete catalog/privilege/RLS equivalence, constraints,
   trigger state, counts and sequences. Any object omissions are a failed or
   explicitly partial recovery, never a complete PASS.
6. Keep API/Auth/Storage services off for sensitive restored data. Real Auth HTTP
   verification requires a separately approved synthetic copy and fresh local
   signing keys; do not import hosted signing secrets or send restored tokens.
   Storage object bytes, Vault/pgsodium root keys, function code, SMTP/OAuth and
   platform settings are separate recovery materials, not proved by a DB dump.

Official references: [Supabase platform-to-self-hosted restore](https://supabase.com/docs/guides/self-hosting/restore-from-platform),
[CLI backup/restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore),
[PostgreSQL pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html).
Some provider migration examples relax triggers or omit incompatible objects;
those shortcuts are not adopted for this integrity-preserving validation.
