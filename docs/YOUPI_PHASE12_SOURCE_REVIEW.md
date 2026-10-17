# Phase 12: Website → YouPI-PG source and contract checkpoint

**Scope:** Uploaded source bundle `CredoNomics-YouPI-Source-Review.zip` was reviewed on 18 Oct 2026. It contains 94 ZIP entries (PowerShell-style backslash paths) across the Phase 11 local BridgeKit and CredoNomics Payment Pilot. The complete original `youpi-pg` runtime, private invoices, encrypted runtime data, and UI assets are not in that sanitized bundle.

## Verified behavior in the uploaded source

- BridgeKit `src/youpi-provider.mjs`: modes are `disabled` and `contract_test`. It only calls an explicitly supplied **fake transport**, and returns `canSettleInvoice: false`. It neither starts real sessions nor provides a deployable public gateway.
- BridgeKit `src/youpi-webhook.mjs`: checks signed raw gateway messages against an expected server order, then classifies them `REVIEW_REQUIRED`, `independentBankVerified: false`. A gateway signature does **not** prove real Slice bank credit.
- BridgeKit `src/bank-credit-reconciliation.mjs`: production reconciliation is disabled and the implemented bank trust is restricted to `LOCAL_MOCK`. Its `invoiceStatus` remains `PENDING` even if a mock reconciliation is `SETTLED`.
- Uploaded Payment Pilot/BridgeKit is not an authenticated, deployed invoice source for the Next.js website.
- The original YouPI public OpenAPI documents `POST /api/v1/payments` with `orderId`, rupee string `amount`, `currency`, `X-Merchant-Id`, `Idempotency-Key`, and returned `paymentId` and `checkoutUrl`. A checkout status or webhook is never a verified bank statement.

## Reproducible sanitized-bundle verification (Node 22 Linux)

- BridgeKit: **124/128 pass**. 4 failures require the excluded original `youpi-pg` runtime and upstream evidence paths. Cannot declare the entire BridgeKit PASS based on the bundle.
- Payment Pilot: **394/397 pass**. 3 HTTP/UI cases failed because static/UI assets are omitted from the source-only export; not sufficient evidence of a production defect.
- Standalone, newly-authored website TypeScript contract: `tsc --noEmit` PASS and 7 independent local Node assertions PASS. Vitest source tests were committed, but the full website Vitest suite has not been locally run against all dependencies.

## Website branch additions

- `app/pay/page.tsx` and CSS: informational integration preview, no real payment action.
- `src/payments/youpi-local-contract.ts`: test-fixture-only order→YouPI API request mapping with merchant ID, idempotency, exact INR paise conversion, local checkout URL allowlist and status-is-not-settlement invariant. No `fetch`, no live transport, and no payment API route.
- `tests/unit/youpi-local-contract.test.ts`: negative contract tests for request mapping, live invoice rejection, amount/merchant mismatches, redirect injection, and fake SUCCESS not marking PAID.
- Local diagnostic scripts read API health and observers, no transactions.
- Existing navigation, invoice state, Supabase, Upstox and main branch are unchanged.

## Deployment blockers that must be addressed *before* actual public collection

1. **Trusted invoices:** A real authenticated server-side invoice repository and merchant order mapping are not present in `credonomics-site`. The client must never select amount, VPA, merchant or invoice ownership.
2. **Public gateway hosting:** Currently YouPI API 6100 and checkout 7000 run on the operator's PC. Vercel cannot connect to `127.0.0.1` on that PC. A reviewed HTTPS host and authenticated private server-side network path are required. Do not publicly tunnel the unaudited merchant/admin service.
3. **Upstream security:** Review YouPI code's public create/payment status routes, admin authorization, checkout error states, session binding, misleading checkout trust claims, raw-secret logging, fraud switches and webhook semantics. Never use the “False Narrative GREEN” developer override to claim readiness.
4. **Payment evidence:** Operator-authorized manual Slice Passbook review must be a distinct, auditable human verification step. Duplicate/mismatched UTR, beneficiary, amount, account, order, and replay conflicts stay `PENDING_REVIEW`. Do not auto-mark PAID on gateway SUCCESS, OTP, QR scan, observer notifications, uploads or test fixtures.
5. **Hosting/billing/licensing:** Confirm ₹0 provider limits, merchant-facing permission for the upstream gateway, authorized bank/account usage, and applicable policies before any external provisioning.

## Unchanged launch gate

**Production collections remain disabled.** This PR is a DRAFT. Vercel preview is not the live gateway. Before a public release: run full source tests including omitted runtime/assets in their own isolated local environment, validate authenticated sessions end-to-end using synthetic-only fixtures, verify a compliant HTTPS deployment, and separately validate permitted live manual reconciliation with operator approval.
