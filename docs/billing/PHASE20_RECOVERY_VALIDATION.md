# Phase 20 — Secure backup and recovery validation

Date: 2026-10-18. Branch: `feature/youpi-payment-entry-prelaunch`. Draft PR #1 only. Additional spend: ₹0.

**Overall result: FAIL / BLOCKED at preflight. No backup or restoration was attempted. Verified staging recovery is NOT established.** This is a prerequisite report, not a successful recovery certificate.

## Continuation from `34a5b8645289a94f74f637a9b663b51190f10506`

This section supersedes the initial tool-availability findings below. Backup/recovery remains **FAIL / BLOCKED**; no staging credentials, records or exports were read, printed or published.

### Windows and installation assessment

- Windows 11 Home Single Language, version `10.0.26300`, AMD64/64-bit. The current process is **not Administrator**. Node `v26.7.0`, npm `12.0.2` and WinGet `v1.29.380` are available. Scoop/Chocolatey/Homebrew were not found on PATH.
- CIM reports `HypervisorPresent=true` while processor virtualization/VM-monitor/SLAT indicators return false. These mixed values do not prove a usable Docker backend or justify changing firmware/Windows settings.
- Docker/Podman executables, matching services, the checked Podman installation directory and Docker engine pipe were not found. No responding free container runtime or its applicable license entitlement was established. No Docker Desktop, WSL, Hyper-V, virtualization, firewall, account, Windows service or system PATH change was made; no administrator installation was attempted.
- C: and D: had approximately 46 GiB and 61 GiB free before the public software download. This is capacity for tools, not approval or capacity validation of a backup destination.
- Selected a **user-local, non-administrator** installation under `%LOCALAPPDATA%/CredoNomicsTools/phase20`, outside the repository. `git -C <tool-root> rev-parse --is-inside-work-tree` did not identify a Git worktree. This directory contains public software only and is not an approved backup/restore-data destination.

### Tools resolved and actual checks

| Item | Result |
| --- | --- |
| Supabase CLI | Installed exact npm package `supabase@2.121.0` in the separate tool directory; package metadata reports MIT license and the official Supabase CLI repository. `--version` returns `2.121.0`; `--help` and `db dump --help` execute successfully. No remote link/login/init/start/dump command was run. |
| PostgreSQL 17 | Downloaded the official EDB-linked `postgresql-17.11-5-windows-x64-binaries.zip` (381,531,864 bytes), extracted client/server binaries, libraries, shared support files and licenses under the separate user-local tool root. All seven `--version` checks returned PostgreSQL **17.11**: `psql`, `pg_dump`, `pg_dumpall`, `pg_restore`, `postgres`, `initdb`, `pg_ctl`. No cluster/server/service was initialized or started. |
| Administrative/system changes | None. Per-user package files only; no global npm install or package-manager/system setup. |

The installation follows the [official Supabase CLI instructions](https://supabase.com/docs/guides/local-development/cli/getting-started), using a pinned npm dependency in a separate tools directory. PostgreSQL's [official Windows download page](https://www.postgresql.org/download/windows/) explicitly links EDB's binary ZIP option, allowing extraction without its administrator installer. The [PostgreSQL License](https://www.postgresql.org/about/licence/) permits use without fee. The ZIP is public software, not a database backup.

Public software archive SHA-256: `80379b2c04d51c30225532e0ae04509899141e9957ed096fe749d7fd9df8f82f`. This is a measured local integrity reference, not an independently published vendor checksum/signature verification. Extraction paths were checked for absolute/parent traversal entries first; none was found. An initial selective `tar` extraction returned an error for an assumed COPYRIGHT path absent from the ZIP; the actual server and third-party license files were then extracted successfully, and all seven executables ran. The extracted server license includes permission for use without fee. No Visual C++ runtime or administrator installer was required for these version checks.

### Exact remaining stop conditions

1. **Existing export credentials unavailable in checked locations.** Presence-only checks again found no configured `PGPASSFILE`, `PGPASSWORD`, `PGSERVICE`, `PGSERVICEFILE` or `SUPABASE_DB_PASSWORD`; the default PostgreSQL password file is absent. This does not prove that no credential exists elsewhere. The owner was asked for only a protected existing credential-file location or an unavailable response, never its contents. No remote login or dump was attempted and no password was reset.
2. **Private encrypted destination and independent recovery remain unconfirmed.** The owner was explicitly asked to supply/confirm a folder outside Git and cloud sync, encryption method and availability of an independent recovery key, without providing keys. No folder answer was available at report preparation. Therefore ACLs, encryption, independent decryption recovery, sync exclusions and actual destination capacity could not be checked. The earlier synthetic DPAPI success is insufficient and has not been promoted to recovery proof.
3. **Faithful full Supabase recovery runtime is unavailable.** The [current Supabase runtime documentation](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes) says its native runtime does not support Windows. A working approved container backend remains a separate requirement for full local-stack testing. Installing/enabling one could require administrator/OS changes and an applicable no-charge license assessment; neither was assumed or performed.

The owner's instruction is to stop on these conditions. No export, database cluster initialization, local database creation or restore follows the credential/destination failure. Tool version checks do not substitute for a real recovery test.

### PostgreSQL-only approach assessed, not executed

The installed CLI help exposes dump flags, but [Supabase's CLI reference](https://supabase.com/docs/reference/cli/supabase-db-dump) documents its normal `db dump` path as container-based. A portable PostgreSQL-only route would use native `pg_dump`/`pg_dumpall` and a separate local PostgreSQL 17 cluster, rather than claiming the CLI's normal dump worked without Docker. It still requires confirmed export authority, private recoverable encryption, coverage review and source/restore validation first.

An authorized later run must explicitly cover roles/memberships/grants, schemas/data, sequence state, migration history and custom auth/storage objects. Native `pg_dump` captures one database; global roles require separate handling. Role password hashes/secrets must not be exposed or automatically transplanted. Preserve private original archives and hashes; separately record any compatibility changes. Storage binaries remain a separate backup item, not included by a logical database dump.

Even a successful native restore cannot prove hosted Supabase Auth/JWT/PostgREST behavior, Storage object retrieval, Realtime, provider configuration or Vault/column-encryption key recovery. Managed roles/extensions/service dependencies must be reviewed individually; skipping failed objects or adding synthetic auth shims is not faithful staging recovery. Object/row-count/constraint/role/RLS comparisons and measured recovery time are **NOT EXECUTED** in this continuation. No fresh Storage inventory or customer-data queries were issued after preflight stopped.

### Actual continuation commands

```powershell
Get-CimInstance Win32_OperatingSystem
Get-CimInstance Win32_Processor
Get-CimInstance Win32_ComputerSystem
Get-Command winget,scoop,choco,brew,docker,podman,psql,pg_dump,pg_restore,supabase,node,npm,tar.exe -ErrorAction SilentlyContinue
node --version
npm --version
winget --version
Get-Service '*docker*','*podman*','*postgres*' -ErrorAction SilentlyContinue
Get-PSDrive C,D
npm view supabase version license dist.tarball --json
$toolRoot = Join-Path $env:LOCALAPPDATA 'CredoNomicsTools/phase20'
npm install --prefix $toolRoot --save-exact --no-audit --no-fund supabase@2.121.0
& (Join-Path $toolRoot 'node_modules/.bin/supabase.cmd') --version
& (Join-Path $toolRoot 'node_modules/.bin/supabase.cmd') --help
& (Join-Path $toolRoot 'node_modules/.bin/supabase.cmd') db dump --help
$archive = Join-Path $toolRoot 'postgresql-17.11-5-windows-x64-binaries.zip'
curl.exe --proto '=https' --tlsv1.2 --fail --location --silent --show-error --output $archive 'https://get.enterprisedb.com/postgresql/postgresql-17.11-5-windows-x64-binaries.zip'
Get-FileHash -Algorithm SHA256 -LiteralPath $archive
$extractRoot = Join-Path $toolRoot 'postgresql-17.11-5'
tar.exe -xf $archive -C $extractRoot pgsql/bin pgsql/lib pgsql/share pgsql/doc/postgresql/html/COPYRIGHT
# Initial extraction reported the nonexistent COPYRIGHT path; corrected license extraction:
tar.exe -xf $archive -C $extractRoot pgsql/server_license.txt pgsql/commandlinetools_3rd_party_licenses.txt
$pgBin = Join-Path $extractRoot 'pgsql/bin'
foreach ($tool in @('psql','pg_dump','pg_dumpall','pg_restore','postgres','initdb','pg_ctl')) {
  & (Join-Path $pgBin ($tool + '.exe')) --version
}
```

CIM output was restricted to OS/architecture and virtualization flags; administrator membership, engine-pipe and credential-file checks printed only non-sensitive metadata/booleans. Official EDB download metadata was checked with an HTTPS HEAD request; public binaries were downloaded over HTTPS outside Git. No password or connection-string arguments were used. Actual continuation tool tests: **7/7 PostgreSQL version probes PASS**, CLI version plus two help commands **PASS**, installed license-file availability and no-fee permission checks **PASS**. No backup, restore or measured recovery test was executed. Full application/SQL suites were not rerun for this documentation/tool-install task. Initial tests below are historical, not newly rerun recovery results.

**All five final gates below remain NOT READY.** The user-local tools improve prerequisites only. No billing migration, exact-ref migration approval, production change or live payment operation is authorized by this continuation. Next owner actions are the pending private-folder/recovery confirmation and local provisioning/location of an existing export credential. Administrator permission is needed only if a later proposed installation actually requires it; it is not being requested for these portable tools.

## Initial preflight record (before continuation)

The remaining sections retain the original `34a5b86` preflight record for audit history. In particular, their missing-tool findings and suggested installation steps are superseded by the successful user-local installations above; their unexecuted backup/restore and unresolved final gates still apply.

### Repository and authorization

- Starting feature SHA after fetching and fast-forwarding: `ba39ab105452c818c0136e9a66725e3358b72efd`. Concurrent Phase 18/19 commits were preserved. The working tree was clean before this report.
- Main was checked read-only at `b492f55631d383465b9bdfa886287643d0460094`; no main commit, merge or production deployment was performed.
- The user's Phase 20 request authorizes the specified private backup/local restore, conditional on successful preflight. No additional backup permission is inferred to be missing. Usable export credentials, tools and secure destination are the blockers.
- No schema migration, database write, credential reset, project/branch provisioning, feature activation, payment operation or customer message was performed. No backup artifact was created, printed, committed or uploaded. Only this non-sensitive report is staged for publication.

## Preflight results

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Exact staging identity | PASS | Fresh connector `get_project`: `credonomics-staging`, ref `jvpiulmcjjnsgozgqgzw`, organization `ewesdskrqxonchucazyr` (CredoNomics Staging). |
| Current Free plan | PASS | Fresh `get_organization`: `plan=free`, `tier=tier_free`. No upgrade or paid operation requested. |
| Provider-reported database health | PASS | `ACTIVE_HEALTHY`; reported PostgreSQL engine 17, build `17.6.1.171`. This is not an export connection or restore test. |
| PostgreSQL 17 backup/restore tools | FAIL / MISSING | `psql`, `pg_dump`, `pg_restore` absent from PATH; checked standard PostgreSQL installation locations absent; no PostgreSQL service or listener found on 5432/5433. This is a bounded inspection, not proof that binaries cannot exist elsewhere. |
| Supabase CLI | FAIL / MISSING | No `supabase` executable on PATH or checked standard Scoop location. CLI version/help/dump were NOT EXECUTED. |
| Docker | FAIL / MISSING | No `docker` executable on PATH, standard Docker installation directory or Docker service found. Docker engine/version were NOT EXECUTED. |
| Local space/filesystem | PASS for availability only | C: and D: report healthy NTFS; approximately 46 GiB and 61 GiB free respectively. Backup size, encryption overhead and restore headroom have not been measured. |
| Encryption capability | PARTIAL | One synthetic in-memory CurrentUser DPAPI protect/unprotect roundtrip PASSED. `cipher`, `icacls`, `manage-bde` and BitLocker inspection command are available. BitLocker state was unavailable to this session. No EFS/BitLocker configuration was changed. |
| Encryption recovery and protected directory | FAIL / NOT ESTABLISHED | No specific private destination was supplied or verified for ACLs, encryption, recovery-key custody, retention, sync exclusion and location outside every Git repository. DPAPI availability does not prove recovery after loss of the Windows user profile or machine. No backup directory was created. |
| Export-capable database access | FAIL / NOT ESTABLISHED | Process checks found no configured `PGPASSFILE`, `PGPASSWORD`, `SUPABASE_DB_PASSWORD` or `SUPABASE_ACCESS_TOKEN`; default PostgreSQL password file absent. Only presence booleans were inspected. Other credential stores/files were not searched or read. Connector metadata access does not establish CLI/pg_dump login or all required export privileges. |

Per the user's explicit stop rule, missing prerequisites stopped the export/restore workflow. No software installation, credential reset, cloud workaround or public CI backup was attempted. No remote SQL queries or customer-record reads were executed in this phase.

## Backup completeness and restore status

| Required component | Backup result | Restore/validation result |
| --- | --- | --- |
| Roles, memberships, ownership and required grants | NOT EXECUTED | NOT EXECUTED |
| Schema, tables, functions, indexes and constraints | NOT EXECUTED | NOT EXECUTED |
| Database data and sequence values | NOT EXECUTED | NOT EXECUTED |
| Relevant migration history | NOT EXECUTED | NOT EXECUTED |
| Custom auth/storage objects and policies | NOT INVENTORIED / NOT EXPORTED | NOT EXECUTED |
| Storage file binaries | NOT CHECKED in this phase / NOT EXPORTED | NOT EXECUTED |
| Private artifact hashes, decryption and unchanged-original verification | NO ARTIFACTS CREATED | NOT EXECUTED |
| Restored object comparison, data counts and permission checks | NO SOURCE BASELINE CAPTURED | NOT EXECUTED |

Supabase Storage is a separate recovery item: database metadata dumps do not recover stored file binaries. Phase 19 recorded an earlier empty Storage inventory; that is historical evidence, not a fresh Phase 20 assertion that Storage is still empty or backed up. Fresh bucket/object inventory and any required file export must occur after preflight succeeds, without publishing file names, keys or data.

No schemas, restored object counts or recovered data counts are claimed here. Phase 18/19 describe earlier synthetic PostgreSQL CI passes; those tests used fabricated records and are not restoration of this staging database. They were not rerun as Phase 20 recovery tests.

## Official procedure reviewed, not executed

Reviewed the current [Supabase CLI backup/restore procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [CLI reference](https://supabase.com/docs/reference/cli/supabase-db-dump) and [changelog](https://supabase.com/changelog). The markdown changelog endpoint returned an unsupported content-type error, so the HTML changelog was used. No live CLI version was available to validate flags locally.

The later private run must cover separate roles, schema and data exports plus the `supabase_migrations` schema/history. Custom `auth`/`storage` changes require separate coverage review; diff-engine exclusions can omit custom objects in managed schemas. Storage binaries need a separate private export if present. Preserve the original exports unchanged, record hashes privately and use a separately documented working copy for any local compatibility adaptation.

Credentials must be provisioned locally through a secure mechanism supported by the installed tool version. Do not put secrets in shell history, command arguments visible in process lists, transcripts, reports or Git. Do not execute documentation steps that reset passwords or create remote projects: this task explicitly prohibits both. Do not export into the repository or run a backup through GitHub Actions.

### Local recovery limitations that must be tested

Bare PostgreSQL 17 is not a complete Supabase environment. Managed roles/ownership, extensions, `auth`/`storage` service dependencies, event triggers, Realtime/publications and scheduled/external integrations may require a compatible isolated local setup. A role-only export does not prove that login secrets or hosted service configuration are recovered. Vault/column encryption, if used, requires its own private key-recovery assessment; encrypted values alone do not prove decryptability. No relevant secrets or encrypted values were inspected here.

Restore only into a newly named database in an isolated local PostgreSQL 17 instance. Do not overwrite an existing local database, change cloud databases, or enable outbound integrations from restored jobs/functions. Use error-stopping restore execution and validate object definitions, ownership/grants, RLS, policies, indexes, constraints, sequence state and available data counts against a private source inventory. If triggers/replication checks are suppressed for loading, document restoration of normal enforcement and independently check resulting consistency. Do not silently skip failures or strip objects and call the result a complete recovery. A PostgreSQL object/data restore alone does not prove functional hosted Auth, Storage or PostgREST recovery.

Separate roles/schema/data/history exports are not automatically evidence of a single application-consistent recovery point. The authorized run must document concurrent-write handling and cross-file consistency, then measure recovery time and verify the retained backup can be decrypted after the restore environment is discarded. Keep retained originals private and unchanged.

## Commands and checks actually executed

No command in this section contained a secret or connection string. Checked presence of selected environment variables, never their values.

```powershell
git status --short
git branch --show-current
git remote -v
git fetch origin feature/youpi-payment-entry-prelaunch
git merge --ff-only origin/feature/youpi-payment-entry-prelaunch
git rev-parse HEAD
git log -12 --format='%h %s'
git ls-remote origin refs/heads/main refs/heads/feature/youpi-payment-entry-prelaunch
rg --files -g AGENTS.md -g '*PHASE18*' -g '*PHASE19*' -g '*PHASE20*' -g '*RECOVERY*' -g '*BACKUP*'
Get-Command git,psql,pg_dump,pg_restore,supabase,docker,gpg,7z -ErrorAction SilentlyContinue
Get-Service '*postgres*','*docker*' -ErrorAction SilentlyContinue
Get-NetTCPConnection -State Listen -LocalPort 5432,5433 -ErrorAction SilentlyContinue
Get-PSDrive -PSProvider FileSystem
Get-Volume -DriveLetter C,D
Get-Command Get-BitLockerVolume,cipher.exe,icacls.exe,manage-bde.exe -ErrorAction SilentlyContinue
Get-BitLockerVolume -MountPoint C:,D: -ErrorAction Stop
node scripts/check-billing-launch-readiness.mjs --self-test
node scripts/check-billing-launch-readiness.mjs --assert-blocked
git diff --check
```

The PowerShell inventory output was limited to executable paths, service/listener availability, filesystem/free-space metadata and boolean credential-presence results. Standard tool paths and the default password-file path were checked with `Test-Path`, without opening private files. `Get-BitLockerVolume` could not return protection status and its error was reduced to a non-sensitive availability message. DPAPI's `Protect`/`Unprotect` methods were exercised on one synthetic in-memory buffer; neither plaintext nor ciphertext was printed or saved.

Actual fresh tests: **1/1 synthetic DPAPI roundtrip PASS**; **5/5 release-checker self-tests PASS**; `--assert-blocked` **PASS**, reporting **NO GO: 2/13 documented gates verified, 11 blocked**. These validate local capability/safety checks, not database recovery. Full app unit/build tests, backup commands, local restore, data comparison, decryption of a real backup and hosted auth/RLS tests were **NOT EXECUTED**. This change is documentation-only.

Before commit, this report is reviewed and scanned for connection-string/credential markers and private artifact paths; only this report is allowed in the staged diff. `git diff --check` must pass. The final report commit SHA is provided in the session result; a commit cannot contain its own hash.

## Final gates

| Gate | Phase 20 result |
| --- | --- |
| 1. Verified staging recovery | FAIL / NOT READY — no export or local restore executed. |
| 2. Migration review and rollback strategy | NOT READY — existing SQL/CI evidence does not establish recoverable staging or an approved rollback. |
| 3. Actual Supabase authentication and RLS testing | NOT READY — not executed by this task; synthetic CI is not hosted JWT/PostgREST evidence. |
| 4. Future YouPI licensing/security verification | NOT READY — no new verified rights/security evidence established; remains a separate release gate. |
| 5. Real compliant WhatsApp OTP with verified ₹0 terms | NOT READY — no entitlement/terms or real OTP integration verified by this task. |

**Migration prerequisites are NOT satisfied. No migration approval is requested yet.** Even after future recovery and other checks pass, obtain separate explicit owner approval for SQL 012–016 on exact project `jvpiulmcjjnsgozgqgzw`. Do not execute those migrations under this backup task.

## Required next steps

1. Make existing/free approved Supabase CLI, PostgreSQL 17 tools and a compatible disposable local runtime available, or provide their non-secret executable locations. Re-run preflight/version/help checks; do not substitute a paid cloud resource.
2. Specify a private local destination outside all Git repositories and cloud sync; verify owner-only permissions, sufficient capacity, encryption and an independently recoverable key/profile strategy. Provide only the folder path and non-secret protection status in chat.
3. Configure authorized export credentials locally using an existing valid credential. Do not paste passwords/tokens/connection strings in chat, and do not reset credentials automatically. Verify least-required export permissions without printing secrets.
4. Repeat exact-ref project/plan/health checks, then complete the official private export and isolated local restore with fresh Storage inventory, auth/storage customization coverage and private consistency/object/count evidence. Publish only sanitized recovery metadata.
5. Request separate exact-ref migration approval only after a genuinely successful recovery validation and reviewed rollback strategy. Keep Draft PR #1, main, live flags, payment collection and all external activation unchanged.
