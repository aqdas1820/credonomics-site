# Phase 23 — Cross-account project sync and actual blocker investigation

Date: 2026-10-18. Scope: `aqdas1820/credonomics-site` Draft PR #1, branch `feature/youpi-payment-entry-prelaunch`. The owner transferred findings from a separate ChatGPT account; the old stated HEAD `5184547` is historical, **not** the present HEAD. Current starting HEAD for this investigation: `167bd81e758b8d0046235bbc7554ac8868a90085`. New findings are supported by fresh connected reads; no unverified historical status is treated as live proof.

**Launch: NO-GO. Strict additional INR 0.** No password reset, billing migration, Stripe or payment activation, customer message, new infrastructure, primary-branch merge or production deployment occurred.

## Fresh independent current-state evidence

- GitHub PR #1 remains open, DRAFT and unmerged. Base production SHA `b492f55631d383465b9bdfa886287643d0460094`.
- Vercel `www.credonomics.in` returned production `READY` for the existing `main` SHA `b492f55631d383465b9bdfa886287643d0460094`, **not** the new billing work.
- Supabase `credonomics-staging` ref `jvpiulmcjjnsgozgqgzw`, organization `CredoNomics Staging`, region `ap-south-1`, PostgreSQL 17.6, `ACTIVE_HEALTHY`, Free.
- Read-only catalog: approx. **11 MB** database, SSL server setting `on`, public tables `alerts`, `ipos`, `notifications`, `profiles`, `watchlist_items`, `watchlists` (all RLS enabled); `billing_private` schema **absent**, `billing_%` RPCs **zero**, Storage buckets/objects **zero** at check time. Existing non-billing migrations are `20260902`, `20260928`, `20260929`, `20260930`.
- One snapshot of database activity exposed Supabase-managed PostgREST/pooler/management/background sessions, **not** a complete survey of external clients; this does not authorize password rotation.
- Published source check [GitHub Actions #39127165018](https://github.com/aqdas1820/credonomics-site/actions/runs/39127165018): **272/272 unit, 200/200 billing, 19/19 disposable PostgreSQL**, build/TypeScript/lint passed for source `005d42f95caf1cca880e27885d5b0c33d246571c`. Subsequent report commits are not separate test runs. Hosted staging Auth/RLS, true WhatsApp OTP, complete PDF/storage recovery and real bank reconciliation remain untested.
- Reviewed [Phase 21](PHASE21_60_MIN_PRODUCTION_SPRINT_REPORT.md), [Phase 22](PHASE22_READ_ONLY_STAGING_CONNECTION_AND_RECOVERY_PREFLIGHT.md), [rotation impact plan](DATABASE_PASSWORD_ROTATION_IMPACT_PLAN.md), and [release manifest](ALL_AT_ONCE_RELEASE_GATES.json). Manifest is still **NO_GO: 2 VERIFIED / 11 BLOCKED**.

## Windows database export: first owner dependency

The owner previously could not locate an existing authorized `postgres` database password. Connected management SQL access is **not** a `pg_dump` credential. No method to retrieve the original plaintext password was established.

Owner-only next checks (no secret sharing):

1. In Windows VeraCrypt confirm the *previously verified* encrypted container is mounted on `R:`; run `Test-Path 'R:\Phase20-Synthetic-Recovery-Test.txt'` and `Get-PSDrive R` in PowerShell, reporting only success/failure and available space. Arrange an independently protected off-device backup of the encrypted container before putting real data into it.
2. Open [the exact staging dashboard](https://supabase.com/dashboard/project/jvpiulmcjjnsgozgqgzw); verify project reference and select **Connect**. Use Direct on functioning IPv6; otherwise the actual dashboard **Session pooler** host and port 5432. Do not guess a pooler region/username; avoid transaction pooler port 6543 for native backups. Supabase reference: https://supabase.com/docs/guides/database/connecting-to-postgres .
3. Privately check original administrator's own password manager or setup records for the **PostgreSQL database password**, not Dashboard login/API/JWT/Berry/WhatsApp credentials. Do not post it in GitHub, screenshots, chat or CI.
4. If missing, **stop**: follow the existing `DATABASE_PASSWORD_ROTATION_IMPACT_PLAN.md`; seek a *separate* exact-project approval covering external dependent clients, replacement secret custody, reconnect tests and the chosen execution window. This task gives no reset authorization. Supabase docs: https://supabase.com/docs/guides/troubleshooting/how-do-i-reset-my-supabase-database-password-oTs5sB .
5. **After** approved/private DB credentials exist, test exact project identity and TLS, export into R: with verified existing PG17 tools or official Docker-based Supabase CLI, preserve roles/schema/data and relevant custom Auth/Storage configuration, then restore into a disposable isolated local PG17 environment. Do not call native `pg_dump` alone a complete Supabase recovery certificate. Record sanitized check results and do not migrate staging until recovery and separate exact-ref migration signoff.

Supabase docs explicitly recommend Free projects make independent logical/off-site backups: https://supabase.com/docs/guides/platform/backups and https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore . Supabase CLI `db dump` needs Docker for its bundled engine. Do not buy IPv4, Pro, or another hosting/database product to bypass missing credentials.

## New Berry / WhatsApp OTP lead investigated in public upstream (NOT local runtime)

Owner reports their separate local YouPI Merchant & Supervisor Hub displayed Berry WhatsApp `CONNECTED`, while Gmail Direct API was disconnected. Local `D:` workspace, private WhatsApp credentials and real message delivery were **not accessible to this connected agent**, so no local service was read and no OTP was sent.

The current publicly visible [YouPI-PG source](https://github.com/youpi-pg/YouPI-PG) *does* contain `apps/payment-api/src/services/whatsapp-berry.service.js` and `apps/payment-api/src/__tests__/whatsapp-berry-auth.test.js`. Important specifics for future authorized inspection:

- `restoreSessionMeta()` can set `status = CONNECTED` from retained session metadata and credential-file existence **before** its asynchronous network initialization completes. A green UI badge or restored status does not alone prove an active socket or successful delivery.
- `sendMessage()` has **mock/test safeguards** and `isSimulatedMode` paths returning `success: true`, `delivered: true` **with** `simulated: true`. The public test suite retrieves `devOtp`; these tests do **not** prove genuine customer delivery.
- In its live branch, success from the Berry send API is labeled `delivered: true`; the observed code does not independently establish recipient-device delivery receipts, WhatsApp Business Platform approval, recurring INR 0 entitlement, or invoice-specific one-use authorization.
- It uses **BerryProtocol / WhatsApp Web linked-device-style** interface, not verified Meta WhatsApp Business authentication-template transport. Check consent, official terms, security controls and actual approved sending method. Do **not** enable an unofficial workaround for customer finance OTP.
- Upstream repository API still reports `license: null`, with no root `LICENSE` observed. This does not grant CredoNomics commercial usage rights.

The Berry status is a **valuable lead, not a VERIFIED release gate**. If the owner can show an approved legal integration and safe test evidence, independently verify one-time expiry, lockout/rate-limit, role/customer and invoice binding, nonenumeration, genuine received OTP, replay denial and provider permission. Never read/export WhatsApp session material or post phone numbers.

## What is ready and what stays blocked

- New secure PDF archive and browser/API denial source changes are available in the feature branch but archive runtime remains feature-flagged OFF, no private production-grade bucket or actual immutable recovered PDF binary verified.
- Review-only SQL 012–016 passed earlier isolated PostgreSQL tests and remain unapplied on staging.
- Staging negative PostgREST tests exist in `tests/staging/billing-postgrest-denial.spec.ts`, separately approval-gated, **not executed against hosted staging**.
- Full launch requires all 13 actual release gates, owner/legal approvals and separately authorized production payment activation. Never merge `main` or mark invoices PAID from gateway SUCCESS alone.

**Priority decision:** Existing authorized staging database password found privately: yes/no? If no, the owner must explicitly decide whether to authorize the exact-project password rotation after the dependency inventory. Until then, perform only read-only source/infrastructure reviews or feature-branch development.
