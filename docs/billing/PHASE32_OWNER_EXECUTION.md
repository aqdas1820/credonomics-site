# Phase 32 owner execution and launch evidence

Status: BLOCKED for real payment. No hosted migrations, passwords, account privileges,
flags, DNS, production deployments or payments changed. Phase31 manual UPI is reused.

## Verified environment (20 October 2026)

Only connected Supabase project: `jvpiulmcjjnsgozgqgzw`, `credonomics-staging`,
organization `ewesdskrqxonchucazyr` / CredoNomics Staging, Free, ap-south-1,
PostgreSQL 17.6.1.171, ACTIVE_HEALTHY. This is the staging target, **not an approved
production target**. Six legacy public tables (profiles, watchlists, watchlist_items,
notifications, ipos, alerts) have RLS; managed Auth/Storage schemas also exist.
`billing_private` is absent. Auth users/admins: zero. Storage buckets: zero.
Existing migration history remains the four September cloud-account/alert migrations.
Do not reset/recreate this database or run blanket `supabase db push`.
Read-only dependency audit: plpgsql1.0, pg_stat_statements1.11, uuid-ossp1.1,
pgcrypto1.3 and **supabase_vault0.3.1**. Public security-definer functions are
rls_auto_enable, trigger_price_alert, handle_new_user and trigger_alert_v2.
Legacy own-row policies and public IPO-reference SELECT remain. Seven enabled
provider/public event triggers include ensure_rls. No legacy objects changed.
Native Windows PostgreSQL alone is not proven to provide supabase_vault0.3.1;
a complete real restore must supply the compatible extension and its key recovery,
or stop. This is a concrete actual-target dependency, not an optional omission.

Google/email providers advertise enabled. This does not verify OAuth client setup,
redirect allowlists, Google login, cookie refresh or administrator authorization.
Vercel variable-name-only audit: Supabase URL/public key/service role exist in preview;
production has only the unrelated Upstox analytics token. No values were decrypted.
Production `/api/account/session` reports configured:false. No production target or
legitimate billing-admin UUID can be inferred from these settings.

## Actual target backup and isolated native Windows restore

Actual owner database export/restore has **NOT RUN** in this session. No R: vault,
existing database password or owner Windows PostgreSQL is attached to this agent.
The new tooling is executable preparation, never evidence of actual recovery.

Use existing Windows PostgreSQL **17** and Python, owner-mounted VeraCrypt **R:**.
Buy/install no infrastructure. Confirm sufficient vault capacity, encrypted/protected
pagefile/hibernation/crash-dump custody, private terminal and no transcript/screen sharing.
R: must resolve through Windows QueryDosDevice to `\Device\VeraCryptVolume...`;
ordinary drives, SUBST and reparse points are refused. Verify mount custody personally.
Do not put credentials in a JSON profile, shell arguments, Git, logs or this chat.

1. Copy `scripts/db-recovery/staging-profile.example.json` to a private path in R:.
   For a different production project, first obtain owner's exact project/org/environment
   designation and review all dependencies; the known staging ref cannot be relabeled.
   If direct IPv6 connectivity is unavailable, copy the actual **session** pooler host
   from that project's Connect dashboard, use port 5432 and username
   `postgres.<exact-project-ref>`. Transaction pooling (6543) is refused. The current
   pooler validator intentionally permits ap-south-1 only. Do not guess the hostname or
   buy the IPv4 addon. Never reset the password to run this procedure.
2. Stop application writers through a separately approved maintenance procedure.
   Export-time before/after inventories must match. They do not make arbitrary concurrent
   hosted writes safe; keep writers quiesced until source evidence is captured.
3. Run in a private owner PowerShell 5.1 session from this repository:

```powershell
$PgBin='C:\Program Files\PostgreSQL\17\bin'
python -m unittest discover -s scripts/db-recovery -p 'test_*.py' -v
if ($LASTEXITCODE -ne 0) { throw 'Guard tests failed' }
./scripts/db-recovery/Invoke-HostedRecovery.ps1 -Mode export -PgBin $PgBin `
  -Profile 'R:\CredoNomics-recovery\staging-profile.json' `
  -Workspace 'R:\CredoNomics-recovery\phase32-export-001' -VaultConfirmed -WritersQuiesced -HostMemoryProtected
```

The existing DB password is entered in an echo-free local prompt. A restricted-ACL
PGPASSFILE is deleted in finally. No PGPASSWORD/service settings are inherited.
TLS verify-full with system trust and default_transaction_read_only are mandatory.
The full native custom archive is not filtered; roles omit passwords. Native export
permissions or managed objects can block export; do not hide failures or omit rows.
Private manifest includes source identity, client version, SHA256, complete catalog,
owner/ACL/RLS/table-trigger/event-trigger/function fingerprints, default grants,
database owner/ACL/locale/settings, row-stream hashes, sequence values,
extensions and password-free role/membership inventories. Actual row bytes are not
printed. Output and diagnostics stay in R:. Fresh directories only, never overwrite.
Retain a separately verified encrypted copy and manifest SHA256 in independent custody.
This does not prove Storage object bytes, Vault/pgsodium root keys, external services,
OAuth/SMTP configuration or signing-key recovery; inventory these separately if used.

4. Privately review `roles.sql`, archive TOC and required extensions before restore.
   Disconnect network; ensure no active external services. The full native archive
   needs an **empty database**, not a preinitialized Supabase Auth baseline.
   Native Windows may lack Supabase extension binaries (pg_graphql, pg_net, Vault,
   pg_cron, etc.). Such a failure is BLOCKED. Do not remove extensions, fake Auth
   helpers, strip ACLs/owners, disable triggers or ignore errors to force success.
   If dependencies are unavailable, use the Phase24 authentic Supabase-image route
   after an explicit full-database compatibility review; app-only recovery is insufficient.
5. Only after local restore approval and the preceding private checks:

```powershell
./scripts/db-recovery/Invoke-HostedRecovery.ps1 -Mode restore -PgBin $PgBin `
  -Backup 'R:\CredoNomics-recovery\phase32-export-001' `
  -Workspace 'R:\CredoNomics-recovery\phase32-restore-001' `
  -VaultConfirmed -AuthorizeLocalRestore -NetworkDisconnected -HostMemoryProtected -RolesReviewed
```

Native initialization uses a temporary password file inside the encrypted vault,
with an explicit current-user-only ACL compatible with PostgreSQL's restricted
Windows token. The workspace also inherits current-user-only ACLs; password files
are deleted in finally. No secret is passed in argv or an interactive child prompt. This creates a new local PGDATA inside R:, random local credentials, loopback-only
server, no preloaded job/network extensions, fresh database and a single-transaction,
fail-fast pg_restore with owners/ACLs/triggers intact. Source role memberships are
replayed explicitly, including predefined-role grants omitted by pg_dumpall, with
original grantor and ADMIN/INHERIT/SET options. Only the exact newly created local
bootstrap principal is excluded from the comparison; other roles remain checked. It compares the entire source
inventory and archive hashes. Server stops in finally; stopped PGDATA and private
logs remain in the vault. A mismatch or missing extension prevents result.json PASS.
Database-level ACL/settings or OS locale mismatches also block recovery; do not
normalize them away. Network disconnection/memory custody are explicit owner attestations, not automated
OS sandbox guarantees. Do not run malicious/unreviewed dumps. The synthetic Windows
CI roundtrip does not exercise VeraCrypt or prove actual hosted backup recovery.

## Auth configuration and exact administrator requirements

Choose one approved production target first. For current staging, Google authorized
redirect URI is `https://jvpiulmcjjnsgozgqgzw.supabase.co/auth/v1/callback`.
Google console OAuth app/client consent/testing state must permit the owner account.
Supabase Site URL and exact additional app callback must match the approved HTTPS
app origin, e.g. `https://www.credonomics.in/auth/callback`; no wildcard preview
redirects for billing. Preview needs its own exact approved origin. Public API settings
cannot establish these private dashboard configurations; no secret-read attempted.

Run `scripts/check-hosted-auth.mjs` with the selected public URL/publishable key,
`BILLING_EXPECTED_SUPABASE_PROJECT_REF` and `AUTH_PREFLIGHT_APP_ORIGIN` in local env.
It prints booleans/URLs only and performs no login or changes. Configure URL/key at
build time for Next public variables; configure server service role privately.
Do not promote preview credentials blindly into production.

Owner signs in normally, then privately verifies the resulting Auth UUID. Both are
required: server environment `BILLING_ADMIN_USER_IDS=<approved-uuid>` and trusted
Auth `app_metadata.billing_admin` **boolean true**, set only by an approved administrator
through Supabase Admin. `user_metadata`, email alone and string "true" are rejected.
There are currently no actual UUIDs to allowlist. Approval must name the actual user;
this PR grants none. Production browser, server and middleware cookies now explicitly
use Secure, SameSite=Lax, Path=/; SSR cookies remain browser-readable for refresh.
Acceptance must test actual Google PKCE exchange, HttpOnly policy rationale, refresh,
logout, and ordinary-user 403 with billing flags enabled only in approved staging.
Unit tests are not hosted Auth evidence.

## Migration approval boundary

`PHASE32_BOOTSTRAP_HASHES.json` preserves all eight Phase31 script hashes and bundle
SHA256 `be4348be6d987701551b63b8ea34eade9b23110bfd7239e14456d97e2c6e95d1`.
Run `node scripts/verify-billing-bootstrap.mjs` before preparing the exact review SQL
with existing `scripts/prepare-billing-pilot-sql.mjs --write NEW_FILE`.
Order: 012 → 013 → 014 → 015 → 016 → Phase28 link ledger → 017 → manual UPI migration.
No SQL changed in Phase32. Native PG17 acceptance tests cover atomic all-eight-script
bootstrap, rollback on final failure, refusal of existing schema, private grants/RLS,
immutable intent/beneficiary, duplicate UTR, concurrent/exactly-once settlement,
paid receipt and synthetic archive roundtrip. No hosted SQL was executed.

After **actual target recovery succeeds**, present owner approval naming project ref,
org, staging/production environment, successful archive/restore evidence, eight hashes,
exact bundle hash and maintenance window. Impact: new private billing schema/tables,
service-role-only RPCs and financial integrity triggers, optional event-function grant
hardening; legacy customer data stays intact. Existing schema is refused atomically.
Rollback: transaction failure rolls back DDL; after commit disable billing/manual/
settlement/webhook flags, revoke outstanding payment instructions and restore prior
application revision. Keep ledger/audit/receipts, never DROP financial tables or
reverse booked credit. Any later schema reversal needs separate reviewed forward SQL.

## Beneficiary and first-payment gate

[Slice savings terms](https://slice.bank.in/savings-terms), operational condition 3,
limit transactions to non-business/non-commercial use. [Business terms](https://slice.bank.in/terms/business),
Digital Current Account condition 3, specify business/commercial use.
Phase32 therefore requires `MANUAL_UPI_ACCOUNT_TYPE=BUSINESS_CURRENT` in addition to
all existing verified-beneficiary/merchant approval gates. This configuration is an
owner assertion, never an automated account verification. Unknown/savings accounts fail.
Do not relabel a personal account or another bank. Current beneficiary/VPA/payee and
business authorization remain unknown; no bank login/API access is available here.

Owner must personally verify authorized legal beneficiary, active VPA, actual UPI-app
resolved payee name, receiving account type/provider terms and official booked-credit
UTR/amount visibility. Use a permitted current account; no credentials/PIN/OTP shared.
If a different bank is intended, provide its actual provider/type and reconciliation
record format first; implement a separately named adapter before approval. No invented
bank identity or generic Slice alias is added. Manual bank review remains mandatory;
webhook SUCCESS/screenshots cannot mark PAID. YouPI commercial rights remain unresolved;
this independent manual path contains no upstream commercial gateway deployment.

A live invoice/link is not created yet. After backup, hosting, hosted Auth, migration,
actual admin and beneficiary evidence pass, prepare one owner-only invoice, verify
signed QR on desktop/mobile and exact amount/payee, then obtain **separate approval for
that exact live test**. Owner pays, independently verifies booked bank credit, records
UTR/amount once, checks one PAID receipt and preserves sanitized evidence. No customer
collection before that acceptance. All activation flags remain false.
