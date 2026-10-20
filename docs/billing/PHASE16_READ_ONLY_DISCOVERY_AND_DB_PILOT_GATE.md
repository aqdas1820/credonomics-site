# Phase 16 — Read-only discovery and gated database pilot plan

**Reviewed:** 2026-10-18. **Branch only:** `feature/youpi-payment-entry-prelaunch`. **Release gate:** STOP. **Spend:** ₹0.

This file records evidence, not permission to run migrations, activate payment collection or merge the draft PR.

## 1. Read-only discovery results

- GitHub: `aqdas1820/credonomics-site`, PR #1 is open and DRAFT; `main` HEAD `b492f55631d383465b9bdfa886287643d0460094`. Feature work reviewed through commit `645f31211d87fad19c92034b3100fa4ee489183f`. This document creates a later feature commit.
- Vercel: inspected production `main` deployment is READY for `b492f55631d383465b9bdfa886287643d0460094`. **Newer verified READY feature preview**: `645f31211d87fad19c92034b3100fa4ee489183f`; deployment `dpl_6GMz2zE58cheebvGUcoxTUUXnndb`. Build logs independently show **12/12 billing test files and 91/91 tests passed** and `Build Completed in /vercel/output`. This verifies the quantity fix and regression test, but not actual SQL execution, complete project tests, authenticated E2E or production readiness. The prior feature tip had a Vercel build-rate-limit failure, and this *documentation* commit may also be rate-limited; do not upgrade to Pro.
- Supabase connector (read-only `list_organizations` and `list_projects`): one organization **Credonomics**; one visible project **aqdas1820's Project**, ref `tpllgtskvvkronmbxkmg`, region `ap-south-1`, status **INACTIVE**. The screenshot-referenced project **credonomics-staging** was NOT visible in these connected results. **Do not infer that the visible project is the same database renamed.** The prior handover says the old connector had shown unrelated CardLedger; no CardLedger writes are allowed.
- No database SQL, migrations, secrets, activation flags, gateway payments, Vercel paid upgrades or production changes were executed as part of this review.

## 2. Source and SQL findings

Reviewed `docs/billing/012`–`016`, invoice creation/admin and settlement APIs, project scope check, YouPI HMAC verifier, read/receipt pages, and static SQL contracts. These are **static-source observations only**; the SQL was not parsed/executed against PostgreSQL.

- `012`: private tables, no RLS policies and receipt append-only trigger are drafted. Audit, bank-credit evidence and original invoice/line records have no equivalent immutability triggers; assess authorized mutation surface and whether original issued invoice data should be write-once before pilot.
- `013`: atomic insertion, unique source-event key, paise recomputation and server-side invoice identity are drafted. A SYSTEM retry with the same source key currently raises a uniqueness error rather than returning the original invoice; document and test the intended retry contract and mismatched-payload behavior.
- `014`: locks invoice `FOR UPDATE`, guards over-credit and global duplicate UTR and snapshots a receipt only on full verified credit. Actual booked-credit evidence and operator authorization must be tested independently in the correct database; a submitted UTR/checkbox is not bank verification.
- `015`: service-role-only private listing/detail and receipt-snapshot RPCs. Confirm grants, `SECURITY DEFINER`, and `auth.role()` semantics with actual Supabase/PostgREST and negative-role integration tests.
- `016`: signed gateway observations are separate from settlement; a `SUCCESS` must never write bank credits, invoice PAID or receipts. Review the `ON CONFLICT DO NOTHING` behavior: conflicting details on the same `(payment_id, event)` are currently reported as duplicates, not independently flagged as contradictory deliveries.
- Upstream YouPI README describes **commercial/sovereign licensing**; usage rights and exact source license have **not** been confirmed. Multiple upstream security issues remain publicly reported. Do not copy upstream source or enable checkout before independent license/security review.
- Missing release dependencies remain: verified legitimate ₹0 WhatsApp OTP, public customer access proofs, payment order/QR binding, independently checked booked Slice credits, durable trusted event trigger, immutable archived PDF binary and retention/delivery.

### Focused source correction and verification

- `app/billing/invoice-math.ts`: reject non-safe / PostgreSQL int4-overrange quantities, including a zero-rate line, so browser/server validation agrees with the SQL `integer` quantity column.
- `app/billing/invoice-math.test.ts`: regression cases for `2147483648` and `9007199254740993` quantity with an otherwise payable invoice.
- Locally tested **8 focused Node smoke cases**, all passing, using the exact updated source blob (`7f7c3475bbfd2333d2e063250c935c4fef8f752b`; confirmed by `git hash-object`). Separately, **Vercel ran and passed the 91-test billing Vitest suite and produced a READY Next.js preview build** at the preceding code commit `645f312...`. No PostgreSQL execution or authenticated browser E2E was conducted.

## 3. Strict GO/NO-GO gates for a database pilot

**Gate 0 — identity, owner, health, no spend (NO-GO until complete):**
1. In owner-authorized Supabase dashboard, identify intended CredoNomics billing project by *name and exact non-secret project ref*, organization, account role, free-plan status and whether this is staging or an approved private pilot. Confirm whether the previously pictured `credonomics-staging` still exists.
2. Require **ACTIVE/HEALTHY**, not `INACTIVE` or `Project is coming up`. Obtain explicit authorization for a specific exact project ref; never apply to CardLedger or an assumed-renamed project.
3. Check existing schemas/functions, extensions, data retention, storage, free-plan limits, availability of backups and practical rollback. No automatic new project/branch, chargeable backup, or paid provider. Handle missing recovery as a NO-GO.
4. Cross-check intended API hostname against `BILLING_EXPECTED_SUPABASE_PROJECT_REF`; do not paste or expose service-role keys or enable any billing flags yet.

**Gate 1 — static/local-only validation (safe before database approval):**
5. Re-run all `npm run test:billing`, project `typecheck`, lint/build in an already available free local or approved runner; record commit and actual output. Never equate the old 90-test build with testing new feature commits.
6. Validate migration syntax and dependencies with a local PostgreSQL-compatible parser/test instance and independent security review. Evaluate RLS/SECURITY DEFINER privilege boundaries, money precision, archive immutability, event idempotency, duplicate delivery anomalies and rollback scripts.
7. Review approved invoice issuer/GST wording, bank identity and amount bindings; no fake OTP or made-up booked bank credits.

**Gate 2 — separate approval before mutation:**
8. Only after Gates 0–1, request an exact-project **go/no-go** and verified recovery plan. Test `012 → 013 → 014 → 015 → 016` in a permitted private test database; do not call the migrations production-approved from static tests.
9. Test unauthorized `anon`/`authenticated` access (including direct RPC calls), admin allowlist checks, service role restriction, missing flags, concurrent invoice creation, source-event retries, same/different UTR, partial/full/over-credit race, webhook replay/contradictions, immutable receipt/line data and audit trails. Use fabricated test data only.
10. Verify no public invoice, real payment route, QR or gateway webhook is enabled; customer info stays private. Record queries/tests and observations in a separate evidence report.

**Gate 3 — later release, independently approved:**
11. Finish real compliant OTP, licensed/secured YouPI checkout, confirmed beneficiary VPA, independently booked bank verification, versioned stored receipt PDF and delivery/retention, threat model and authenticated E2E.
12. Obtain a separate explicit release decision for merge to `main` and any live-money action. Do not activate production flags just because a Vercel deployment says READY.

## 4. Genuine user-dependent action

**Verify via Supabase dashboard which exact project is intended and why the connected project `tpllgtskvvkronmbxkmg` is INACTIVE while the handover names `credonomics-staging`.** Reauthorize the correct organization/project if required, and provide only the non-secret project ref or screenshot of the project list. No database changes can safely proceed until this mismatch is resolved.
