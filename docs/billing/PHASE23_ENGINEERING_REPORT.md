# Phase 23 — Railway backup recovery and feature-only PR integration

Date: 2026-10-19 (Asia/Calcutta). Release decision: **NO GO**. Work is confined to
`codex/phase23-backup-integration`, targeting `feature/youpi-payment-entry-prelaunch`.
No merge to `main`, deployment, Supabase/Railway infrastructure mutation, live
payment, credential read or live volume export was performed. Additional spend
authorized and incurred by this work: INR 0. Standard hosted Actions runners are
used only for this public repository's synthetic checks, without cloud secrets.

## Railway diagnosis and implemented recovery tooling

Read the exact Railway CLI tag **v5.70.0**, commit
`5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1`. Local `railway --version` confirmed
5.70.0. Local OpenSSH is `OpenSSH_for_Windows_9.5p2`.

`src/controllers/ssh/authentication.rs` skips passphrase prompting if stdin is
not a terminal **or** Railway detects an agent. `keys.rs` uses Pageant on Windows,
and the Unix OpenSSH socket on Unix. The Windows OpenSSH agent is therefore not
interoperable with Railway's embedded client in this version. `files.rs` sends
both list and download through the same authentication implementation. Interactive
listing does not prove a later noninteractive download can decrypt the key.
Concurrency affects transfers, not authentication. The exact original caller's
environment was not captured; attributing the difference to a particular env var
would exceed the evidence. The browser loading hang remains unreproduced.

The supported alternative is native OpenSSH/SFTP against the **Railway-resolved
service instance**, including its mounted `/data`. It preserves the existing
encrypted key and uses an owner-unlocked agent. No key passphrase is removed,
private key created, host verification disabled, or hostname inferred.

Deliverables:

- `scripts/railway-backup/Backup-RailwayVolume.ps1`: operator entry point with
  mandatory encrypted-vault, zero-incremental-cost and quiesced-writer attestations.
- `Backup.Core.psm1`: version pin; exact project/environment/service/instance/volume
  IDs and names, attachment and mount checks; Railway-generated SSH target check;
  strict existing host trust; runtime identity validation; fresh non-overwriting
  partial attempt; native exit validation; before/after remote and local SHA-256
  inventories; atomic directory publication; idempotent integrity recheck and OS lock.
- `remote-inventory.cjs`: read-only remote Node walker. Handles hidden files and
  empty directories; rejects links, special files, Windows-invalid names and case
  collisions. It emits paths/sizes/hashes, never contents. All transfer/inventory
  artifacts stay on R:. No remote package installation or filesystem writes.
- [Exact staging and production operator runbook](RAILWAY_BACKUP_OPERATOR_RUNBOOK.md),
  including official syntax, manual fallback, host trust, retry and recovery limits.

The public entry point accepts only `R:\CredoNomics-recovery`; test injection is
confined to the core's explicit synthetic mode and is not exposed by the operator
entry point. Retried partial copies are preserved and never promoted on failure.
This certifies file bytes/paths, not Unix permissions, transaction-level database
consistency, credential validity or an application restore. Quiescing writers,
private key unlock, capacity/egress allowance and live restore remain operator gates.
The local OpenSSH agent is **Stopped / Disabled**; it was not enabled or unlocked.
No claim of a successful live Railway export is made.

## Exact PR evidence and integration order

Read-only GitHub REST API and Git fetch agreed on these heads on 2026-10-19:

| Item | Exact source SHA | Evidence |
| --- | --- | --- |
| Billing base | `92cd66a1fcce6eef611e05f769a2762c27288d39` | Both PRs target `feature/youpi-payment-entry-prelaunch` |
| [Draft PR #2](https://github.com/aqdas1820/credonomics-site/pull/2) | `8f052a531fe74f74ccc3d1a060e569e95724e3b9` | [CI success 39138905626](https://github.com/aqdas1820/credonomics-site/actions/runs/39138905626) |
| [Draft PR #3](https://github.com/aqdas1820/credonomics-site/pull/3) | `947b34f4207fb602ae464f8340bf13622eeb1b3b` | [CI success 39143727566](https://github.com/aqdas1820/credonomics-site/actions/runs/39143727566) |
| Local PR2+PR3 merge | `b89bcf7069684c0fe1cd1bc95dc1e698ab08c7c5` | Clean non-fast-forward merges, PR2 then PR3 |

PR2 adds commits `f0990a582ea5c79a8ba6436642a37904864314b8` and
`8f052a531fe74f74ccc3d1a060e569e95724e3b9`: 18 files, +594/-15.
PR3 adds `c2ed691c7e56bbe42275e67198cf956ba47ea32e`,
`4cd9c898617ae3012403864faaa1c36c2c450b30`,
`a758f7de50bcd61f7e1ff584a8bc5a666215c319`, and its final head: 10 incremental
files, +888/-3. `git merge-base --is-ancestor origin/pr2 origin/pr3` succeeds.
PR3 already contains PR2's history. Do not cherry-pick the overlapping changes
twice or squash PR2 then blindly replay PR3's entire billing-base diff.

Validated order: merge exact PR2 head into the billing feature branch, then PR3
using preserved ancestry. Local merges had **zero conflicts**. Shared workflow,
report and `vercel.json` edits reconcile cleanly. The integration branch also
disables its own Vercel Git preview deployment. No other branch was pushed or merged.

## Security and regression review

| Area | Verified source behavior | Limit / acceptance still needed |
| --- | --- | --- |
| Invoice integrity | Existing integer-paise arithmetic, line totals, snapshot UUID binding and SYSTEM-event idempotency are unchanged. PR2 exports the existing archive verifier and fixes final blank-page allocation. | Issuer/tax/privacy approval and real database E2E remain required. |
| PDF archive | Strict envelope, canonical snapshot equality, PDF framing, SHA-256 and keyed HMAC; existing objects are read/verified rather than regenerated. `upsert:false`; a conflict is reread/verified. PR2 accepts documented duplicate 400 + `ResourceAlreadyExists`, rejects arbitrary 400/403; size limits must be positive safe integers. | Application create-only behavior is **not provider WORM**. Service-role/storage operators can still replace/delete bytes. HMAC key custody/rotation, bucket policy, retention and independent backup are unproven. |
| Auth / RLS | Document routes gate flags and database scope, validate UUID/kind, call hosted `getUser` through the server adapter, require trusted boolean `app_metadata.billing_admin` **and** UUID allowlist; service client created only after authorization. POST checks origin. Error output is generic and PDFs use private/no-store headers. SQL 012–016 remains unchanged; service-role RPC guards/private schema restrictions remain covered synthetically. | Server service-role bypass means application checks matter. Ordinary users, forged/expired JWTs and cross-invoice access must be tested against real Auth/PostgREST/Storage. A role shim is not real JWT/RLS proof. |
| Token encryption | PR3 is an inert prototype, not imported by the backend or production app. AES-256-GCM, random 96-bit nonce, 128-bit tag, nonextractable keys and AAD bind version/scope/key/revision; strict envelope/metadata/expiry checks; generic errors; no plaintext fallback. | Key recovery, provider expiry, actual runtime binding and production migration are unconfigured. Encrypted data alone is not sufficient recovery material. |
| Atomic token CAS | SQLite/D1 adapter uses insert-on-conflict-do-nothing for revision zero and a single conditional update for later revisions; exactly one changed row means success. Conflicting rotation cannot be overwritten by stale expiry or a lost-ack retry. Recovery re-encrypts at a higher revision. | Tests use real local SQLite with a binding shim, not hosted D1. Primary reads and an independent durable minimum-revision checkpoint are required; a cold process without that checkpoint cannot detect a full-row rollback. Request/OAuth state protocol and sole-writer cutover still need design. |
| Backend prototype | Request-scoped handler defaults unavailable; fixed provider origin, bounded response/timeout, entitlement/auth checks, `isLive:false`. | It is not full backend parity or continuous streaming. No hosting replacement approved. |

No blocking regression was found in PR2/PR3's incremental source diffs. Merge
readiness is **feature integration only, conditional on exact integration CI**;
production and live token-store migration remain **NO GO**. The integration PR
is a consolidated alternative to merging #2/#3 individually: choose one path to
avoid duplicate review/merges; leave the original drafts open until that choice.

## Validation performed

At merged source `b89bcf7069684c0fe1cd1bc95dc1e698ab08c7c5`:

- `npm test`: **282 tests / 39 files passed**.
- `node --test prototypes/worker-market-api/worker.test.mjs prototypes/encrypted-token-store/store.test.mjs`:
  **21 passed** (4 snapshot API, 17 encrypted-store).
- `node scripts/test-billing-archive-recovery.mjs`: **1 passed**, synthetic only.
- `npm run build`, subsequent `npm run typecheck`, and `npm run lint`: **exit 0**.
  Existing CSS compatibility, image, hook-dependency and Next lint-deprecation
  warnings remain; none was silently treated as a new clean warning baseline.
- Release readiness self-test: **5 passed**; `--assert-blocked` confirms **NO GO**.
- Windows PowerShell 5.1 backup fixtures: **13 passed**; remote helper Node fixtures:
  **2 passed**. No cloud calls, tokens or real keys used. Synthetic native Windows
  argv → Git Bash → Node decoding also passed, covering the PS5.1 quoting boundary.

The local machine has no discoverable `psql`/Docker runtime; no live database was
used as a substitute. Existing exact-head CI proves PostgreSQL 17: **19 cases**
for PR2 (job `117709045710`) and **20 cases** for PR3 (job `117723216970`), including
service-role and anonymous/authenticated permission boundaries. Source jobs
`117709045506` / `117723216719` also completed successfully. The integration PR
runs the 20-case suite and full source checks again, plus Windows synthetic backup
checks. Integration evidence is appended after those runs complete; prior PR
success must not be represented as integration-head success.

## Release manifest reconciliation

`ALL_AT_ONCE_RELEASE_GATES.json` remains fail-closed and unmodified. Its historical
`lastVerifiedSourceCommit` is `ade2ce951bd8a6a99feed0c71fe11a547424dc8a`; do not
mistake this for the newest PR head. It records 2/13 VERIFIED and 11 BLOCKED.

| Manifest gate | Phase23 assessment |
| --- | --- |
| source_ci | VERIFIED for the exact older manifest evidence and PR2/PR3 heads above; integration is separately recorded below. |
| staging_identity | VERIFIED historically, not rechecked against live Supabase in this phase. |
| free_recovery | PARTIALLY VERIFIED locally: synthetic archive/token/volume-copy drills pass. Actual Railway/Supabase export, key custody and restore remain BLOCKED. |
| staging_migration_approval | BLOCKED; no SQL applied. |
| staging_auth_e2e | PARTIALLY VERIFIED source/shim tests; hosted identities and isolation BLOCKED. |
| issuer_tax_privacy | BLOCKED; owner/legal particulars unavailable. |
| whatsapp_otp | BLOCKED; neither real server verification nor verified zero-cost delivery established. |
| youpi_license | BLOCKED; valid explicit commercial rights absent from evidence. |
| youpi_security | BLOCKED; upstream vulnerabilities not independently closed. |
| merchant_beneficiary | BLOCKED; vetted merchant/order binding and authorized checkout absent. |
| slice_banked_credit | PARTIALLY VERIFIED SQL invariants; independent official bank-credit evidence BLOCKED. |
| pdf_archive | PARTIALLY VERIFIED create-only contract and local recovery; real private storage permissions/retention/recovery BLOCKED. |
| production_e2e_approval | BLOCKED; no production merge, deployment or payment activation approval. |

PARTIALLY VERIFIED is this report's assessment, not a change to the manifest's
binary gate state. None of these partial results authorizes release.

## Specific acceptance tests and next safe steps

Execute remote tests only after exact-project approval and approved synthetic
fixtures. Existing `HOSTED_ACCEPTANCE_RUNBOOK.md`, `tests/staging/hosted-acceptance.spec.ts`
and `catalog-acceptance.sql` provide opt-in read-only baselines; they do not prove
create/update behaviors or authorize remote writes. Keep local session states
and outputs off GitHub/CI.

| Gate | Required experiment | Acceptance / rejection |
| --- | --- | --- |
| Real Auth/RLS | Two distinct hosted users (trusted allowlisted admin and ordinary user), anonymous client, forged/expired JWT, edited `user_metadata`, removed allowlist. Establish a positive admin baseline before negative tests. Probe billing-private tables, all RPCs and archive paths directly as each role. | Only verified allowlisted admin reaches authorized app routes; ordinary/anon cannot list/read/write private rows or invoke privileged RPCs. Cross-invoice UUID/RPC substitution fails. Tampered metadata never elevates. Record only boolean outcomes/statuses. |
| PDF create-only/recovery | In approved staging synthetic fixture, POST same invoice concurrently, GET after restart, try altered snapshot and denied storage policy, test ordinary-user direct upload/upsert/delete. Restore the retained envelope into isolated recovery storage with privately retained HMAC key. | One retained object; exact identical PDF hash on repeat/recovery, no regeneration; conflict verifies winner; corruption/wrong key/policy denial fail closed. UNPAID invoice never becomes a receipt. Never mutate the source archive to test recovery. |
| Bank-credit/receipt | Authorized synthetic ledger: partial, exact full, over-credit; same UTR retry, reused UTR on another invoice, simultaneous credits, forged gateway SUCCESS/COD/QR screenshot. Independently reconcile official booked credit and beneficiary/order/amount. | No receipt before verified booked credit; one immutable receipt at settled total, replay no duplicate, conflicting UTR rejected, over-credit explicit handling. Actual bank proof cannot be fabricated by fixtures. |
| WhatsApp OTP | Inspect pinned upstream implementation and verify code only on server with expiry, attempt cap/rate limit, single-use atomic consume and phone+invoice+purpose binding. Exercise wrong/expired/replayed code, simultaneous submit, new session and cross-invoice reuse; verify through authorized real delivery with known terms. | Browser flag/localStorage cannot authenticate; server rechecks each protected operation; no plaintext OTP/log exposure; real delivery and recurring INR0 evidenced. Otherwise remain blocked. |
| YouPI licensing/security | Pin upstream SHA, obtain explicit usable commercial grant; audit exposed credentials, observer trust, payment attribution, COD/SUCCESS, UPI beneficiary and OTP abuse paths. Reproduce each negative exploit in an isolated synthetic harness. | Written rights and independently reproduced closure for each finding; gateway event alone cannot settle an invoice. No new live checkout test before authorization. |
| INR0 hosting / Upstox | Measure synthetic request/CPU/memory/state budgets on approved free account; test quota exhaustion as 429/503. Model clients × polling rate × session length, durable key/DB/checkpoint costs, egress and backups. Separately test authorized feed redirect/Protobuf decode, reconnect, subscription aggregation, token rotation and loss of coordinator. | No billable resource or automatic upgrade; snapshot UI labels freshness and `isLive:false`. Full persistent streaming remains blocked until runtime lifecycle, quotas and provider/exchange redistribution rights are proven. Free HTTP hosting is not streaming equivalence. |

Current official [Railway pricing](https://railway.com/pricing) includes metered
resource/egress charges; an export needs allowance verification. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
document Free request/CPU/memory constraints; [Upstox V3 limits](https://upstox.com/developer/api-documentation/v3/get-market-data-feed/)
specify two normal connections per user and category-dependent subscription
ceilings. These are provider limits, not proof of public redistribution entitlement
or continuous zero-cost hosting. No paid Plus capacity is proposed.

Next boundaries are concrete: owner unlocks existing key/enables local agent,
confirms no incremental transfer charge and safe writer quiescence, fills exact
staging/production identities, performs private exports and isolated recovery;
then separately approves hosted synthetic Auth/RLS/archive acceptance. Keep all
live payments disabled. Re-review heads if either PR or the billing base moves.
