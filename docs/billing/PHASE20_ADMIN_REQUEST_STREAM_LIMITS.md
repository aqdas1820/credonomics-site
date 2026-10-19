# Phase 20 — Admin request streaming byte limits

Date: 2026-10-18. Draft PR #1 only, feature branch `feature/youpi-payment-entry-prelaunch`. Cost ₹0. No migrations, main merge or payment enablement.

## Finding addressed

Phase 20 source review identified that the invoice-create and booked-credit admin POST handlers checked the final size **after** `await request.text()`. For requests with absent/incorrect Content-Length, this could buffer the complete body before rejecting it.

## Source-only changes

- Added `app/billing/bounded-json-body.ts`: a standard ReadableStream byte reader that caps accumulated bytes, checks well-formed declared Content-Length early (when present), enforces actual streamed byte count without trusting the header, cancels streams when oversized, and rejects malformed UTF-8/input. No JSON is trusted until it passes downstream strict domain validation.
- `app/api/billing/admin/invoices/route.ts`: preserves authentication/admin/scope/origin enforcement, then uses the bounded reader with the existing **65536-byte** cap; oversized requests return HTTP 413. Invalid body syntax/encoding returns 400.
- `app/api/billing/admin/invoices/[id]/verify-credit/route.ts`: same approach with **8192-byte** cap, keeping the independent Slice-booked-credit operator attestation requirement. No gateway event marks invoices PAID.
- Added `app/billing/bounded-json-body.test.ts` with **10** cases: normal JSON, exact cap, early header rejection, no Content-Length, inaccurate length, multibyte UTF-8, malformed/unsafe length, invalid UTF-8, empty/disconnected streams.
- Updated `.github/workflows/billing-postgres-validation.yml` path filters so modifications under `app/api/billing/**` trigger both source/build and disposable PostgreSQL CI.

## Actual verification

GitHub Actions run **[#39124097138](https://github.com/aqdas1820/credonomics-site/actions/runs/39124097138)** at code commit `a4378d59bad40c3efd5a2339ec3cc87beb79e7cf`:

- Full unit suite **198/198 pass** (32 files).
- Billing prebuild suite **126/126 pass** (16 files), including the new 10 streaming reader tests.
- Local Next.js production build, TypeScript check and lint job **PASS**.
- Disposable PostgreSQL 17 SQL 012–016 integration job **PASS** (**19/19 synthetic cases**); this is **not** a hosted Supabase staging migration or authentication test.
- Release checker self-tests **PASS**; current manifest **NO GO, 2/13 verified, 11 blocked**.

An earlier intermediary run [#39123918744](https://github.com/aqdas1820/credonomics-site/actions/runs/39123918744) exposed a TypeScript mismatch in synthetic stream fixture types. It is **superseded** by the following test-only typing correction and successful complete run above. Do not count the intermediate failure as a production build failure after the fix.

## Limits and follow-up

- The handler retains at most its declared byte cap in an array of chunks (excluding any single already-delivered stream chunk). Any buffering already performed by the browser, reverse proxy, serverless provider or Next.js ingress is **outside the handler's control**. Configure and verify request-body limits at the upstream ingress as defense in depth before feature activation.
- These unit checks do not test live adversarial HTTP connections or actual deployed gateway limits; keep route flags disabled.
- Phase 20 Supabase backup/restore remains **BLOCKED** because existing authorized database export credentials are unavailable. VeraCrypt same-machine synthetic encryption recovery was independently verified; it does not substitute for real database recovery.
- No credential retrieval, reset, backup, restoration, staging schema migration, `main` merge, payment activation or paid action occurred here.
- Maintain exact project scope `jvpiulmcjjnsgozgqgzw` and obtain explicit separate owner approval after a proven secure backup/restore before staging SQL 012–016.

This file records evidence; it is not an automatic release authorization.
