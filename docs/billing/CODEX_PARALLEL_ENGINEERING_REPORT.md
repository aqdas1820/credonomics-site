# Codex parallel engineering report

2026-10-18, Asia/Calcutta. **Review-stage source implementation; release NO GO.**
Additional spend: INR 0. No deployment or hosted mutation executed.

## 1. Source, coordination and review target

- Starting latest feature SHA: **`92cd66a1fcce6eef611e05f769a2762c27288d39`**,
  fetched from GitHub before creating a new worktree/branch. Existing concurrent
  commits through that SHA are ancestors; no force push or feature/main write.
- Separate branch: `codex/billing-production-hardening`.
- Ending implementation SHA: **`f0990a582ea5c79a8ba6436642a37904864314b8`**.
  This report is a subsequent documentation-only commit; its final delivery SHA
  is supplied in the session/PR head because a commit cannot embed its own hash.
- Separate review: [Draft PR #2](https://github.com/aqdas1820/credonomics-site/pull/2),
  **base `feature/youpi-payment-entry-prelaunch`, not main**. Draft PR #1 remains
  untouched. Review/merge this PR only into the feature branch after approval;
  production release remains a different decision.
- Backend inspected read-only at
  **`3bcfe78e24de1924b2be301ad9c66f887c2bd5ed`**. No backend commit, credential
  file, persisted token, hosted environment, Railway service/volume or owner
  restore database was inspected or modified. No unlicensed YouPI code imported.

## 2. PDF archive code and validation

Found a real adapter contract mismatch: Supabase documents duplicate standard
uploads as HTTP 400, while the adapter handled only 409. The installed SDK exposes
the service-specific `code`. The fix accepts 409 or **400 ResourceAlreadyExists**
only, leaving ordinary bad requests/permission failures unavailable. Persisted
winner bytes still undergo snapshot/SHA-256/HMAC validation; duplicates do not
permit overwrites. [Official upload behavior](https://supabase.com/docs/guides/storage/uploads/standard-uploads).

- `document-storage.ts`: requires a positive safe-integer bucket size cap, <=
  2,000,000 bytes, private visibility and JSON MIME allowance. No bucket creation,
  upsert, delete, public URL or feature activation was added.
- `document-storage-contract.test.ts`: uses the **real installed Supabase SDK**
  and a fresh loopback HTTP server, not mocked SDK methods. Exercises missing
  objects, exact persisted bytes through a fresh client, actual 400 duplicate
  serialization, public/missing bucket, missing permission and permission loss.
  It models the API, not actual Supabase durability/RLS.
- `document-archive.ts`: exports the existing authenticated envelope verifier for
  reuse by recovery verification, without changing v1 format/key semantics.
- `document-recovery.test.ts` and `scripts/test-billing-archive-recovery.mjs`:
  fabricated invoice PDF retained on disk, exclusive create refusal, independent
  copy, new adapter instance, exact PDF/hash recovery, corruption rejection and
  unchanged original digest. Temp synthetic files are cleaned. The script accepts
  no user paths and never opens owner backups or a cloud endpoint.
- `document-pdf.ts`: avoids allocating a blank trailing page after the final line.
  Existing validation preserves exact integer paise/line consistency, original
  invoice identity/status and a distinct versioned full-bank-credit receipt.
  Existing long-document, font, receipt and corruption tests continue to pass.

**Status:** source/SDK/local synthetic recovery PASS. Actual private Supabase
bucket configuration, service permissions, provider overwrite/deletion prevention,
retention/legal hold, full issuance-to-archive coverage, independent key custody
and hosted archive restoration are **NOT RUN / infrastructure handoff**. Application
create-only/HMAC integrity is not certified WORM storage. Customer retrieval remains
denied; no fake customer identity or OTP route was introduced. See existing
[archive threat model](PDF_ARCHIVE_SECURITY.md).

## 3. Backend feasibility and working prototype

The exact dependency/compatibility matrix is in
[BACKEND_ZERO_COST_COMPATIBILITY.md](BACKEND_ZERO_COST_COMPATIBILITY.md).

The backend needs a persistent Fastify listener, Upstox ws/protobuf feed with
reconnect timers, aggregate subscription/client Maps, in-memory TTL caches,
file-backed broker token/metadata writes and an in-memory OAuth state Map.
Authenticated scheduler-trigger routes exist; no internal recurring scheduler
was found in inspected startup. External Upstox/Yahoo/Google calls remain subject
to provider credentials/entitlements. Dormant helpers are distinguished from
registered application behavior in the compatibility report.

**Finding:** a bounded stateless read-only snapshot subset is technically plausible
on Workers Free; unchanged full-backend migration and continuous broker feed
operation at sustainable INR 0 are **not established**. No token store, scheduler,
WebSocket client or Railway volume was moved. Free hosting is not provider licensing.

`prototypes/worker-market-api/worker.mjs` is an independently runnable Web API
handler. It is disabled unless separately configured, server-to-server authenticated,
entitlement gated, GET-only, strict single-instrument bound, fixed-origin upstream,
redirect-rejecting, timeout/response-byte bounded and output projected without
credentials. It emits SNAPSHOT/isLive:false. Four offline tests pass; no real token,
provider call or Cloudflare account/resource/deployment was used. No drop-in API
parity, production distributed rate limiting or measured edge CPU claim is made.

## 4. Billing security, UI and release hardening

- Preserved existing admin identity, customer denial, invoice UUID/RPC binding,
  original invoice/PAID receipt separation, idempotency, paise arithmetic, UTR
  uniqueness, partial/full/over-credit rules and observation-only YouPI behavior.
- Archive download has an immediate in-flight ref lock to prevent double-clicks
  before rerender; unique invoice-specific download filenames and aria-busy state.
  Existing generic error/status output remains private and accessible.
- Private document controls wrap on narrow screens and expose visible keyboard
  focus. A4 repeats table headings, avoids splitting key sections and hides controls.
- Browser tests inspect synthetic authorized SSR fixtures at 320/375/768 pixels
  and generate an in-memory A4 PDF with amount/quantity text still visible. No
  screenshot, actual customer PDF or session export was committed/uploaded.
- [Rollback and infrastructure checklist](CODEX_RELEASE_ROLLBACK_CHECKS.md) covers
  corruption/access failures, original preservation, key compatibility and staged
  verification. Prepared real staging tests remain opt-in and unexecuted here.
- CI now supports PRs targeting the billing feature branch and includes offline
  Worker tests and synthetic browser/A4 checks. No deployment job was added.
- `vercel.json` disables automatic deployment for this **exact Codex branch only**
  using the documented git.deploymentEnabled setting; the existing cron and all
  other branch defaults are retained. No hosted setting was changed. [Official
  branch deployment controls](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled).

## 5. Actual local commands and results

| Executed command/check | Actual result |
| --- | --- |
| `npm test` | PASS, **282 tests / 39 files**, including existing billing security and new SDK/recovery cases. |
| `npm run build` | PASS, Next 15.5.28 production build; prebuild billing run **207 tests / 23 files** before three additional unsafe-metadata cases were added. Those three then passed in the full 282-test run and targeted 11-case storage suite. No production deploy. |
| `npm run typecheck` | PASS after final source/test edits. |
| `npm run lint` | PASS, existing non-billing warnings and next-lint deprecation remain. |
| Targeted `npx eslint` on prototype/scripts/new tests | PASS. |
| `node --test prototypes/worker-market-api/worker.test.mjs` | PASS, **4** offline Web API cases. |
| `node scripts/test-billing-archive-recovery.mjs` | PASS, **1** real-filesystem synthetic retention/copy/recovery drill. |
| `npx vitest run app/billing/document-integrity.test.ts` with synthetic fixture export | PASS, **11** document cases; process-local export flag removed afterward. |
| `npx playwright test --config=playwright.billing-local.config.ts` | PASS, **7** local HTTP/browser/mobile/A4 cases. Loopback server stopped by runner. |
| `npx playwright test --config=playwright.billing-staging.config.ts --list` | PASS listing **6 cases / 2 files only**; hosted execution NOT RUN. |
| `node scripts/check-billing-launch-readiness.mjs --assert-blocked` | PASS: **NO GO; 2/13 verified, 11 blocked**. No manifest gate upgraded. |
| `python scripts/test-billing-postgres.py` | PASS, **19** cases on a newly initialized separate LOCAL PostgreSQL 17.11 cluster; test DB created/dropped by suite, cluster stopped afterward. Review SQL 012–016 applied **locally only**, never to hosted staging or the owner's restore. |
| Source/secret/artifact checks, `git diff --check` | PASS before source commit; no actual records, credentials, PDFs, dumps or backup files staged. |

Local PG setup used existing portable `initdb`/`pg_ctl` tools, a fresh UUID-named
scratch cluster outside Git, loopback 127.0.0.1:55471 and a synthetic test-only role.
No service/OS installation or owner credential was needed. This is not the owner's
database recovery work, nor proof of complete hosted Supabase recovery. No PG
listener remains on that synthetic port. Stopped synthetic cluster scratch is
retained outside Git; no private backup content was introduced.

No new dependency audit was run in this assignment; the existing dependency lock
was not changed. Earlier audit findings are historical, not freshly certified here.
Remote CI at this PR must be distinguished from these local results; any separately
observed CI outcome is recorded in the follow-up or session result.

## 6. Infrastructure handoff and next-stage definition of done

Infrastructure agent/owner retain responsibility for credential decisions, exact
Supabase/Railway state, approved backups, private Windows restore, actual resource
configuration and provider/merchant entitlements. This PR hands off source contracts
and verification procedures only; it sends no messages or infrastructure changes.

Next **review/integration stage** is done only when:

1. Reviewers approve PR #2 into the billing feature branch, preserving concurrent
   commits and keeping Draft PR #1/main unmerged; exact integrated source CI passes.
2. Infrastructure agent verifies actual bucket/private access, duplicate behavior,
   least privileges and source-format compatibility after separate approvals;
   actual retention/key recovery and byte-preserving archive restoration are proven.
3. Owner's private database recovery evidence is reviewed independently; any later
   staging SQL 012–016 application gets its own exact-project authorization. This
   assignment authorizes none of those operations.
4. Approved synthetic staging sessions/fixtures verify hosted JWT/Auth/RLS/customer
   denial, invoice/idempotency/UTR/receipt transitions and archive authorization.
   Local shims/mocks and listed tests are not substitutes.
5. Backend owners review the prototype's reduced snapshot contract, quota/load,
   authentication/rate limits, freshness, token custody and provider rights before
   deciding any hosting migration. A full stream replacement needs separate proof.

Full **production** definition of done remains all 13 release gates plus separate
owner main/deployment/live-collection approval, including written YouPI rights and
security close-out, approved beneficiary/bank reconciliation, official recurring
INR 0 WhatsApp OTP entitlement and actual secure delivery, issuer/privacy/tax and
retention decisions. These external gates remain BLOCKED. No mock success, fake
OTP, paid provider or unlicensed gateway workaround is proposed.
# Follow-up after Draft PR #2 — 2026-10-18

This section records new source-only work; the earlier assignment above remains historical.

## Verified source and integration review

- Starting source / PR #2 head: `8f052a531fe74f74ccc3d1a060e569e95724e3b9`.
- Remote billing feature: `92cd66a1fcce6eef611e05f769a2762c27288d39`.
- Remote main: `b492f55631d383465b9bdfa886287643d0460094` (untouched).
- Remote backend main and inspected source: `3bcfe78e24de1924b2be301ad9c66f887c2bd5ed`.
- Ending implementation commit: `c2ed691c7e56bbe42275e67198cf956ba47ea32e`.
  The subsequent documentation-only commit is available as this PR's HEAD and in owner delivery.
- GitHub API confirmed [CI 39138905626](https://github.com/aqdas1820/credonomics-site/actions/runs/39138905626)
  completed SUCCESS for exact PR #2 head, both source and 19-case PostgreSQL jobs.
- Reviewed the 18-file PR #2 diff, focusing on duplicate Storage handling, bucket metadata
  gates, immutable winner verification, PDF pagination, UI in-flight lock, tests, prototype
  isolation and deployment guard. No blocking source defect found in this scoped review.
- `git merge-tree --write-tree <feature-sha> <pr2-head>` succeeded, result tree
  `0cbe6f47c97bb1f1fcec64ab66c28bcc5ecf7786`. This is a local integration check, not a branch merge.
  Recommendation: suitable for integration into the billing feature after review/promotion;
  NOT a production-readiness approval. PR #2 remains draft and unmerged; no main integration.

New branch: `codex/upstox-token-persistence`, stacked on PR #2 to avoid changing its reviewed
head. Publish as a separate draft against `codex/billing-production-hardening` while PR #2
is pending. After PR #2 integration, merge/reconcile the latest billing feature into this
branch without rewriting history, retarget to `feature/youpi-payment-entry-prelaunch`, inspect
the resulting diff and rerun CI. Never target main. The Git deployment guard disables this
new exact branch; no hosted configuration or deployment was performed.

## Deliverables and actual local results

| Verification | Actual result |
| --- | --- |
| `node --experimental-sqlite --test prototypes/encrypted-token-store/store.test.mjs` | PASS: 17 synthetic cases |
| `npm test` | PASS: 282 tests / 39 files |
| `npm run build` | PASS, including 210 billing prebuild tests; existing CSS/autoprefixer/cache warnings |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS with existing image/hook warnings and Next lint deprecation |
| `python scripts/test-billing-postgres.py` | PASS: 20 cases, disposable LOCAL PG17.11, including catalog RLS fault detection |
| `node --test prototypes/worker-market-api/worker.test.mjs` | PASS: 4 offline cases |
| `BILLING_DOCUMENT_FIXTURES=1 npx vitest run app/billing/document-integrity.test.ts` | PASS: 11; synthetic fixtures only, variable removed afterward |
| `npx playwright test --config=playwright.billing-local.config.ts` | PASS: 7 local browser cases |
| `npx playwright test --config=playwright.billing-staging.config.ts --list` | 9 discovered; no hosted calls |
| Same staging command without `--list`, with approvals absent | 9 SKIPPED; hosted verification NOT RUN |
| `node scripts/check-billing-launch-readiness.mjs --assert-blocked` | PASS: release remains NO GO, 2/13 documented gates, 11 blocked |
| `git diff --check` | PASS |

PG setup used the existing portable `initdb.exe` / `pg_ctl.exe` / `psql.exe` binaries.
Created a new UUID-named scratch cluster under local application data with `initdb -U
codex_synthetic -A trust --no-locale -E UTF8`; started it using `pg_ctl -o "-h 127.0.0.1
-p 55473" -w start`. Set child-shell-only `PGHOST=127.0.0.1`, `PGPORT=55473`,
`PGUSER=codex_synthetic`, `BILLING_PG_DISPOSABLE=1` and ran the Python suite. Its own
UUID-named test database was dropped; `pg_ctl -m fast -w stop` succeeded in finally.
SQL 012–016 ran ONLY in that disposable synthetic database. No owner restore/backup path,
VeraCrypt setup, hosted connection or Railway volume was accessed. No new tools installed.
Build-generated IPO/search data changes were reverted in this isolated worktree.

Implementation and exact future cutover/rollback sequence:
[UPSTOX_TOKEN_PERSISTENCE_DESIGN.md](UPSTOX_TOKEN_PERSISTENCE_DESIGN.md).
Hosted acceptance fixtures, approvals, commands and limits:
[HOSTED_ACCEPTANCE_RUNBOOK.md](HOSTED_ACCEPTANCE_RUNBOOK.md).

## Status, blockers and handoff

- Token encryption/CAS/expiry/recovery prototype: PASS locally. Real token migration: NOT RUN.
  No real token or token hash was read, copied, emitted or committed. Synthetic temporary
  SQLite files were removed by tests; no database export is tracked.
- Proposed sustainable zero-additional-cost path: Workers Free + D1 Free within quotas.
  Actual spend: ₹0. No resource created. Account eligibility/aggregate quota and hosted CPU,
  primary consistency, provider terms and outage recovery remain unverified.
- Backend integration BLOCKED on a separate interface/controller PR and hosting/bridge
  design. This is not a drop-in adapter, a deployed credential service or a replacement for
  the continuous WebSocket backend. File store race risks are documented, not patched live.
- Independent production key recovery/checkpoints and global rollback detection are NOT
  proven. Synthetic key re-import is not owner custody verification. Preserve old volume;
  never silently fall back to a stale file after the first new remote write.
- Infrastructure agent: independently finish recovery work; obtain exact-project approvals;
  verify private archive configuration, key custody and hosted Auth/RLS with synthetic users;
  only then run separately authorized hosted tests. Do not apply migrations from this report.
- Auth browser states must privately correspond to the independently verified JWT identities.
  True hosted RLS behavior, customer OTP ownership, archive concurrency/retention/recovery and
  PAID receipt acceptance remain separate gates. Private schema denial is not proof of row
  policy execution. Real YouPI licensing/security and merchant/WhatsApp approvals remain open.

Definition of done for the next stage: feature-only review/integration with exact-head CI;
backend revision propagation plus replay tests; approved Free hosting path and key/checkpoint
recovery; hosted synthetic recovery/quota/concurrency evidence; independently approved
Supabase migrations/resources and passing non-skipped hosted acceptance. None authorizes
production deployment, password resets, paid activation or live payments.
