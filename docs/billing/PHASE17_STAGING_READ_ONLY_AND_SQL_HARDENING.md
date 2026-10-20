# Phase 17 — CredoNomics staging read-only inspection and draft billing hardening

**Date:** 2026-10-18. **Scope:** `aqdas1820/credonomics-site`, Draft PR #1, branch `feature/youpi-payment-entry-prelaunch`. **Cost rule:** strictly ₹0. **Database release gate:** NO-GO pending backup/recovery and explicit migration approval.

## Verified database identity and state (official Supabase connector; read-only)

- Organization: **CredoNomics Staging** (`ewesdskrqxonchucazyr`).
- Project: **credonomics-staging**, exact ref **`jvpiulmcjjnsgozgqgzw`**, region **`ap-south-1`**, status **ACTIVE_HEALTHY**, PostgreSQL 17.
- Existing user-facing tables in `public`: `profiles`, `watchlists`, `watchlist_items`, `alerts`, `notifications`, `ipos` (six tables from connector response; all report RLS enabled). Table-list row estimates do **not** prove that user data is absent.
- No `billing_private` schema exists yet: independently confirmed with a SELECT on `pg_namespace`. No `billing_*` function was found by the read-only function catalog query. Thus SQL 012–016 are **not applied**.
- Supabase migration registry currently lists: `20260902 cloud_accounts`, `20260928 atomic_alert_notifications`, `20260929 alert_engine_v2`, `20260930 alert_safety`. These are **unrelated** to billing and must not be altered.
- Supabase installed extensions include `pgcrypto`, `uuid-ossp`, `plpgsql` and other site extensions; no dependency changes were made.
- **Project's actual plan/billing, backups, rollback capability, account role, function execution under PostgREST, admin allowlist and Vercel project environment binding have NOT been fully verified.** Screenshot history showed Free, but that is not a current billing-plan proof.

## Existing database advisor findings (read-only)

- SECURITY WARN (anon): `public.rls_auto_enable()`, `SECURITY DEFINER`, EXECUTE available to `anon`.
  https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- SECURITY WARN (authenticated): same function executable by `authenticated`.
  https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- Read-only catalog inspection shows function owned by `postgres`, returns `event_trigger`, and is used by enabled `ensure_rls` on `ddl_command_end` to enable RLS on newly created `public` tables. The advisor's general RPC risk warning **does not prove that a PostgreSQL event-trigger function is directly callable as a normal RPC**; test exact exposure and preserve existing automatic RLS enforcement before changing grants. No alteration was made.
- PERFORMANCE INFO: missing FK covering index for `public.notifications.alert_id`; six currently unused public indexes. These are unrelated to billing; no schema modifications were made.
  https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## Code changes in Draft PR #1 only

1. `22a4f47e`: SQL `016` now ACKs as duplicate only when an already-stored signed observation matches `payment_id`, `event`, invoice, order, amount, UTR **and raw body SHA-256**. Same payment+event with contradictory details raises an error for review; remains observation-only, never PAID.
2. `229d5cf2`: static migration test asserts exact replay verification and conflict rejection.
3. `9468ab17`: SQL `012` draft adds UPDATE/DELETE rejection triggers for `invoice_lines`, `bank_credit_evidence` and `audit_events`, preserving financial history.
4. `2daf0b0a`: static tests assert evidence append-only triggers.
5. `d53c3668`: SQL `012` draft prevents UPDATE of original issued invoice identity, customer, date, currency, total, origin and source event. Current `status` and `updated_at` remain mutable so the reviewed reconciliation RPC can advance payment status.
6. `576dc1ce`: static tests assert the issuance-preservation trigger and protected columns.

**Verification boundaries:** The YouPI replay change/test at `229d5cf2` has a Vercel **READY** preview, with build logs showing **91/91 billing tests in 12 files passed**. The later SQL draft-hardening commits have **not** yet been confirmed through a successful Vercel build due to the free build-rate-limit status. A separate in-session **22/22 targeted static source checks** passed after these commits; this is NOT a real PostgreSQL SQL parse/execution, Vitest run, concurrency test or authenticated E2E proof. Do not represent it as such.

## Next gates before any SQL migration (NO-GO)

1. Verify current staging project Free plan, provider billing exposure, available backups/export, **tested restore/rollback strategy**, membership and approved use of this existing project. No paid backup, branch, second project, Pro upgrade or surprise charges.
2. Independently review all five current migration drafts (including new triggers) for Postgres syntax, PostgREST calls, privileges/RLS, existing migrations, transaction/rollback safety, function grants and compatibility with the active event trigger. Execute parser/integration tests in a free isolated local environment if available.
3. Establish a migration manifest and prove exact application order: `012 → 013 → 014 → 015 → 016`, with an explicit go/no-go approving project ref **`jvpiulmcjjnsgozgqgzw`** and recovery plan. No migrations until then.
4. Use only fabricated bank credits/invoices in the private pilot; test admin authentication, source-event retries, partial/full/over-credit and concurrency, duplicate/mismatched UTR, replay conflicts and negative-role RPC access. Verified booked Slice credit is independently obtained from legitimate bank records, NEVER a gateway SUCCESS alone.
5. Continue blocked release dependencies separately: real compliant ₹0 WhatsApp OTP solution, YouPI merchant license/security and beneficiary verification, archived immutable versioned PDF binary, retention/privacy review, full E2E, and separate production gate.

**Never touch:** `main`, production deployment/payment flags, unrelated public tables, CardLedger, or any real payment collection before independently approved launch. Keep secrets out of ChatGPT and Git.
