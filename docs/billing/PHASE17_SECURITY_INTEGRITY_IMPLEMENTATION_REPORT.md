# Phase 17 — Security and financial integrity implementation

Date: 2026-10-18. Repository: `aqdas1820/credonomics-site`. Branch: `feature/youpi-payment-entry-prelaunch`. PR #1 remains DRAFT. Release gate: **NO-GO**. Spend: ₹0.

## Revision and baseline evidence

- Starting GitHub feature SHA: `b65bea52e30a4202695026b756e9d697b8660804`, verified with `git ls-remote` and PR metadata, then cloned using the existing feature branch.
- Ending validated implementation SHA: `a75c3de84b55b9915015602ba962cdbd760cbe6d`. This report is a subsequent documentation-only commit; the exact final published branch-tip SHA is recorded in the PR #1 update. Resolve the report commit with `git log -1 --format=%H -- docs/billing/PHASE17_SECURITY_INTEGRITY_IMPLEMENTATION_REPORT.md` rather than attempting a self-referential commit hash inside its own contents.
- Main SHA checked read-only: `b492f55631d383465b9bdfa886287643d0460094`. No main checkout, commit, merge or push was performed.
- The supplied working directory was a payment-pilot directory without `.git`. Work was isolated in its new `phase17-credonomics-site` clone; the pilot, Flutter project, other checkouts and CardLedger were untouched.
- Read Phase 16/15/14 handovers and SQL 012–016 before editing. Existing int4 quantity fix and its zero-rate regression tests were preserved.
- `npm ci --ignore-scripts --no-audit --no-fund`: PASS, 386 packages installed from the existing lockfile; no dependency or lockfile change.
- Initial `npm run test:billing`: **90 PASS / 1 FAIL**, 12 files, 91 tests. Static SQL quoting test assumed LF line endings and failed on Windows CRLF. The regex now accepts both; immediate rerun: **91/91 PASS**.

### Concurrent development preserved

Two fetches detected concurrent work. All seven new remote commits through `d47db1148884be5e1eb1cb228918430773c251bf` were merged as ancestors, never reset or force-pushed. These included webhook contradiction protection, evidence/header immutability and a separate staging discovery report. SQL 012 in that work contained two invalid `as $ ... $;` function delimiters. The merge consolidated duplicate guards into valid `$$` functions, retained the concurrent trigger names and security intent, and adapted static contracts to the consolidated behavior. SQL 016's competing conflict implementations were consolidated into serialized exact replay checks with a persistent conflict audit. Both reconciliations were reparsed and retested.

## Significant changed files

| File | Result |
| --- | --- |
| `app/billing/migration-contract.test.ts` | Windows newline support; preserve concurrent hardening contracts with consolidated trigger/replay checks. |
| `docs/billing/012_billing_private_review.sql` | Immutable issuance, sealed lines, append-only evidence/audit, TRUNCATE guards and explicit runtime table/sequence/function revocations. |
| `docs/billing/013_invoice_create_rpc_REVIEW_ONLY.sql` | SYSTEM event serialization, canonical payload equality and explicit conflict rejection. |
| `docs/billing/016_youpi_observation_rpc_REVIEW_ONLY.sql` | Serialize deliveries, compare original fields and raw hash, durable security conflict audit, reject NULL digest, protect TRUNCATE. |
| `src/lib/billing/system-issuance.ts` | Return original retry result and surface `SYSTEM_EVENT_PAYLOAD_CONFLICT` without exposing DB errors. |
| `src/lib/billing/system-issuance.test.ts` | Nine mocked adapter cases for validated submission, retry, conflict, disabled/scope/identity guards and client authority rejection. |
| `src/lib/billing/youpi-observation-store.ts` | Surface `YOUPI_SECURITY_REVIEW_CONFLICT`; reject ambiguous recorded/duplicate acknowledgements. |
| `src/lib/billing/youpi-observation-store.test.ts` | Nine mocked adapter cases including contradictory signed amount, UTR, order and extra payload. |
| `app/billing/BillingForm.tsx` | Hide draft form and browser state from print; issued document printing requires the persisted invoice route. |
| `app/billing/invoices/[id]/invoice.module.css` | Preserve quantity readability, accommodate small-screen numeric columns, avoid splitting a printed line row. |
| `app/billing/document-integrity.test.ts` | Seven real server-component rendering tests with synthetic RPC responses, including receipt and authorization denial. Optional synthetic fixture export. |
| `vitest.config.mts` | Enable JSX transform for server-component tests without altering Next.js TS configuration. |
| `scripts/check-billing-documents.mjs` | Offline Chromium screen/print assertions and synthetic PDF/screenshots. |
| `scripts/test-billing-postgres.py` | Nineteen executable local database integration cases, including concurrency and mutation negatives. **NOT EXECUTED** against PostgreSQL. |
| `scripts/parse-billing-sql.py` | Repeatable PostgreSQL 17 SQL and PL/pgSQL grammar validation. |
| `docs/billing/PHASE17_STAGING_READ_ONLY_AND_SQL_HARDENING.md` | Concurrent discovery report preserved; current connector evidence below supersedes its unresolved plan check. |
| This report | Verified results, limitations and owner pilot gates. |

SQL 014/015 and the raw-body HMAC verifier were reviewed and retained. No public payment/webhook endpoint, OTP bypass, payment session, feature flag or PDF storage integration was added.

## Implemented policies and security findings

### Trusted SYSTEM events

Authentication, service-role execution grants, project scope, enabled flags, configured actor and strict invoice input checks remain mandatory. There is no public SYSTEM issuance route. An event key must identify a trusted business event in an owner-controlled namespace; an external caller does not gain authority by choosing a key.

The SQL RPC validates every line and recomputes paise, then obtains a transaction advisory lock for the source key before looking for the existing invoice. It compares trimmed customer/address, phone, date, total and ordered normalized original line descriptions/quantities/rates/totals. Equivalent validated representations are the same payload. A match returns the original ID/number/total and **current persisted status**, including PARTIAL/PAID after later settlement. It does not reissue an UNPAID document or consume a new sequence number. A mismatch raises SQLSTATE `P1701`. Audit actor is delivery metadata, not an invoice payload field; the original issuance audit remains authoritative.

The unique source key remains the independent final guard. Under normal READ COMMITTED RPC transactions, lock serialization is designed to permit at most one creation. Higher transaction isolation can require transaction retries. **Actual concurrent database behavior is not yet verified.**

### Signed YouPI observations

The existing `X-Gateway-Signature` HMAC-SHA256 over exact raw bytes is unchanged. No invented timestamp/delivery header contract, upstream source copy or new endpoint was introduced. Signature, INR, exact amount representations, size and SUCCESS UTR checks remain in force.

The database serializes payment identity and compares `(payment_id,event)` against the stored order, amount, UTR and raw SHA-256. Identical raw delivery returns an idempotent duplicate without a second normal audit entry. Any different signed payload, including changed extra JSON or whitespace, is conservatively a **SECURITY_REVIEW_CONFLICT**. It appends a hash-only conflict audit against the original invoice and returns a conflict result; the server adapter then throws an explicit security-review error. Returning a conflict from SQL rather than raising preserves that audit on RPC commit. A larger caller-managed transaction that rolls back can still roll back its audit.

New unknown orders and unmatched invoice amounts are rejected. A cross-identity raw-hash uniqueness collision fails closed. Invalid currency is rejected before the RPC. Every valid normal observation, including SUCCESS, remains REVIEW_REQUIRED. No observation inserts bank evidence, changes an invoice payment status or issues a receipt. Contradictory deliveries cannot silently become normal duplicates. A durable trusted payment-session/order binding is still a later integration dependency.

### Financial immutability and corrections

- All invoice fields except `status`/`updated_at` are protected on UPDATE; DELETE is rejected. Allowed status changes require evidence-backed UNPAID/PARTIAL → PARTIAL/PAID amounts; backward transitions and unbacked PAID fail.
- Original invoice lines reject UPDATE/DELETE and further INSERT after the INVOICE_CREATED audit seals issuance. The line-insert guard locks the parent invoice.
- Bank evidence and audit history reject UPDATE/DELETE. Receipt and observation append-only protections are retained. All six financial tables reject TRUNCATE, including cascading TRUNCATE attempts.
- Runtime roles have no direct private table/sequence mutation grants; only reviewed RPCs grant service-role execution. RLS remains enabled without public access policies. Definer RPCs retain fixed catalog/temp search paths and schema-qualified relation references.
- Owners/superusers can disable triggers or alter schemas. These controls are not tamper-proof against database administrators; application credentials must never include DDL/owner authority. The connected SQL inspection reports `postgres`, which is a connector inspection role, not approval to use that authority in the application.
- **Correction workflow:** no silent edits, trigger bypass, direct VOID or evidence reversal is implemented. An operator must stop the affected workflow, retain original records, and request a reviewed compensating document/credit-note or append-only adjustment design with original references, reason and authorized audit. That correction capability needs its own schema, tests and approval. Current application/RPC operations deliberately cannot perform it.

### Invoice and receipt source integrity

The existing issued route already reads `billing_get_invoice` after verified admin authorization and scope checks; that prior fix was preserved. A remaining browser Print/Ctrl+P path could print the saved form's browser values under the issued number. The form is now hidden in print media in all states. Its issued-document link opens the authoritative route, which renders persisted number/customer/address/date/lines and integer paise, current status and outstanding balance. A separate validated snapshot route renders the PAID receipt only after full verified settlement.

The synthetic maximum-value print fixture exposed a quantity column wrapping digits across lines. Quantity no-wrap, small-screen padding/wrapping and print row-break rules address that finding. Automated screen/print checks and visual inspection used synthetic documents. Multi-page 100-line print pagination, real browser sessions, real customer data, issuer/GST details and archived production PDF binaries remain unverified. Test PDFs under ignored `artifacts/` are explicitly synthetic, not issued financial archives.

## Executed validation

| Command/check | Actual result |
| --- | --- |
| Initial `npm run test:billing` | FAIL: 90 passed, 1 failed / 91; Windows newline test issue fixed. |
| Final `npm run test:billing` | PASS: 116 tests / 15 files. |
| `npm test` | PASS: 188 tests / 31 files. |
| `npm run typecheck` | PASS when run after build completes. One intermediate concurrent build/typecheck run failed TS6053 because Next was replacing generated `.next/types`; sequential rerun passed. |
| `npm run lint` | PASS, zero errors; 10 existing non-billing hook/image warnings. |
| `npm run build` | PASS locally, including mandatory billing prebuild tests. Existing unrelated CSS/autoprefixer and lint warnings remain. Generated IPO/search timestamp changes were restored; no unrelated data changes committed. |
| `$env:BILLING_DOCUMENT_FIXTURES='1'; npx vitest run app/billing/document-integrity.test.ts` | PASS: 7 tests / 1 file; exports synthetic real-component HTML. |
| `node scripts/check-billing-documents.mjs` | PASS: 25 checks = five documents × four widths (320/375/768/1440) plus A4 print visibility/PDF export. Browser fixture CSS mapping issue during setup was corrected before PASS. |
| `python -m py_compile scripts/test-billing-postgres.py scripts/parse-billing-sql.py` | PASS: both Python scripts compile. |
| `python scripts/parse-billing-sql.py` with isolated `pglast==7.20` | PASS: PostgreSQL 17.7 grammar; 80 SQL statements and 11 PL/pgSQL functions across all five files in dependency order. |
| `python scripts/test-billing-postgres.py` | **NOT EXECUTED**: exits with explicit prerequisite message; no `psql`, Docker/service or local listener at usual 5432/5433 was found. |
| `git diff --check` | PASS. |

Raw local build/lint logs and synthetic HTML/PDF/PNG files are under ignored `artifacts/`; none contains real billing records or environment secrets. The grammar parser was installed only into ignored `artifacts/pgparser`, not application dependencies.

### PostgreSQL evidence boundaries and executable handover

The parse checks prove grammar acceptance, **not migration execution**, catalog dependency resolution, Supabase/PostgREST auth, RLS effectiveness, transaction atomicity, trigger execution, uniqueness under contention or successful rollback. The SQL remains REVIEW-ONLY and is **not production-ready**. No billing SQL was applied remotely.

The local integration runner creates a UUID-named database only on a permitted loopback host and drops only that database. It rejects remote host/service overrides and requires explicit `BILLING_PG_DISPOSABLE=1`. Use an existing disposable local administrator account; do not provide cloud credentials or production exports. It may create missing `anon`, `authenticated`, `service_role` NOLOGIN roles in that disposable cluster and does not modify pre-existing role definitions. Its test-only `auth.role()` shim tests claim/grant contracts, not genuine PostgREST token validation.

```powershell
# Only after a free disposable LOCAL PostgreSQL cluster and psql are available:
$env:PGHOST='127.0.0.1'
$env:BILLING_PG_DISPOSABLE='1'
# Set PGUSER/PGPORT locally if required; never paste a password into reports.
python scripts/test-billing-postgres.py

# Reproduce static parsing without starting any database:
python -m pip install --only-binary=:all: --target artifacts/pgparser pglast==7.20
$env:PYTHONPATH=(Resolve-Path artifacts/pgparser).Path
python scripts/parse-billing-sql.py
```

The 19 prepared integration cases apply 012 → 013 → 014 → 015 → 016 and exercise normal/retried/conflicting SYSTEM events, simultaneous identical/conflicting events, unique numbering, role and RLS denial, numeric boundaries, transactional creation/settlement rollback, partial/full payment, global duplicate UTR, overcredit races, immutable invoice/line/evidence/audit/receipt/observation mutation and TRUNCATE negatives, exact replay, contradictory webhook fields, unknown orders, NULL digests and concurrent replay. **None of those runtime cases has a claimed PASS.**

## Read-only Supabase identity evidence

Early in this session, connected `list_projects`/`get_project` returned only inactive `tpllgtskvvkronmbxkmg` in organization `fhhnjwkxugysbwdgrmuc` (Credonomics, Free). That result did not identify staging.

After the concurrent discovery document appeared, fresh independent connector calls returned:

- Project **credonomics-staging**, ref **`jvpiulmcjjnsgozgqgzw`**, organization **CredoNomics Staging** (`ewesdskrqxonchucazyr`), region `ap-south-1`, **ACTIVE_HEALTHY**.
- `get_organization` independently returned **plan free / tier_free** for that staging organization.
- A read-only catalog SELECT confirmed PostgreSQL **17.6**, **billing_schema_exists=false**, **billing_rpc_count=0**. No customer records were selected.

This is a changed connector-visible scope, not evidence of a rename or equivalence between the two project references. Staging identity, health and current organization plan are now independently confirmed. Membership/owner authority, backup/restore, Vercel environment binding and permission to mutate remain separate gates. Existing public schemas and migration history must be preserved. The separate concurrent report's advisor findings have not been changed or represented as fixed here.

## YouPI, Slice and Vercel status

YouPI remains a disabled server-only observation adapter with raw-body HMAC verification. No new public webhook or checkout session was exposed or tested against live upstream services. Licensing, merchant/beneficiary approval and exact live runtime compatibility remain unverified; no upstream code was copied. Slice reconciliation remains an explicitly gated human attestation after independent official booked-credit review. No real bank credits were queried, asserted or fabricated as real. SMS/Gmail/gateway SUCCESS is never settlement evidence.

GitHub's combined Vercel status for starting SHA `b65bea52...` and concurrent tip `d47db114...` was **failure**, with the free **build-rate-limit** upgrade target. Historical READY previews in earlier handovers are not verification of this implementation. This session used successful local builds; no Vercel deployment/retry/upgrade was requested. A normal feature push may trigger the existing automatic preview integration; no production deployment or promotion is authorized. The final PR update records any observable final-commit status without claiming remote READY prematurely.

## Remaining blockers and exact owner actions

1. Confirm the intended pilot is specifically `jvpiulmcjjnsgozgqgzw` in `ewesdskrqxonchucazyr`; identify the approving owner and intended operator/auth IDs through the dashboard. Do not authorize by project name alone, and never use CardLedger.
2. Provide a practical free backup/export and **tested restore/rollback plan** for existing staging schemas/data, and verify free quotas/no chargeable backup, branching or provider billing. Do not copy production data to tests.
3. Run the prepared disposable PostgreSQL suite; resolve any failures. Separately test genuine Supabase/PostgREST service-role, missing/forged claims, anon/authenticated RPC denials and admin allowlist flows on the approved pilot.
4. Review migration manifest and existing extensions/event triggers; obtain explicit owner **go/no-go for applying 012–016 to this exact project ref** with that recovery plan. Current identity discovery is not migration approval. Do not enable any billing flags during this phase.
5. Independently verify Vercel environment/project hostname binding to `BILLING_EXPECTED_SUPABASE_PROJECT_REF`, without exposing service keys or giving runtime credentials owner authority.
6. Approve legal issuer/address/GST applicability, numbering/correction policy, privacy/retention and independent Slice operator evidence requirements. Real bank evidence is a prerequisite to any actual settlement.
7. Finish genuine customer WhatsApp OTP authorization with expiry/rate limits/replay protection under verified ₹0 terms; no fake OTP or public invoice lookup.
8. Resolve licensed YouPI use/security, secure merchant transport, immutable invoice-to-order/beneficiary binding and authenticated payment E2E. No real payment initiation during this phase.
9. Validate retention/infrastructure before enabling immutable PDF binary generation, storage and delivery. Browser PDF output and JSON receipt snapshots are not an archival service.
10. Keep PR #1 draft; any merge, production release, payment collection or live feature activation requires its own later authorization. No paid resources, upgrades or Stripe.

## Next implementation phase

Phase 18 should execute and remediate the disposable PostgreSQL/security/concurrency suite, then an explicitly approved staging-only database pilot with tested recovery and genuine PostgREST/authenticated browser flows. Only after those gates should separate work proceed on customer OTP, licensed payment-session binding and retained PDF archives. No live billing readiness is claimed by Phase 17.
