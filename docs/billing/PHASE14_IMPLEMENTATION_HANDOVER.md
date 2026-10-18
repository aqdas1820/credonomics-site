# CredoNomics Billing — implementation handover and launch gates (2026-10-18)

**Scope:** draft branch `feature/youpi-payment-entry-prelaunch`, never merge into `main` or activate live payments without review. Strict ₹0 spend.

## Code implemented on draft branch

1. `/billing` protected by verified Supabase `auth.getUser()`, trusted `app_metadata.billing_admin === true`, and `BILLING_ADMIN_USER_IDS`. Unknown users receive 404; hosted portal defaults OFF.
2. Admin invoice form validates INR integer paise server-side. The authenticated POST `/api/billing/admin/invoices` calls a service-role-only atomic SQL RPC to create invoice/lines/audit and allocate a unique `CN-YYYY-XXXXXXXX` number. Original UNPAID copy is browser-printable.
3. Private invoice list/detail API, admin invoice history and print-friendly historical invoice page.
4. CredoNomics settlement policy and default-OFF `verify-credit` admin endpoint. Only an operator attesting to actual BOOKED Slice bank credit can submit official statement reference, booked timestamp, amount and UTR. Atomic row-lock/duplicate-UTR/overpayment/audit SQL review files included.
5. PAID-only printable receipt view reads a **versioned append-only SQL receipt snapshot** created atomically on verified full Slice settlement; rejects duplicate/mismatched UTR data and inconsistent receipt identity. This is **NOT yet an immutable signed or archived PDF file**.
6. A gated server-only system invoice issuance function accepts trusted unique business-event IDs and prevents duplicate event creation using a DB unique constraint. **No trusted external business-event trigger is wired.**
7. A pure raw-body HMAC-SHA256 YouPI V2 webhook verifier maps signed SUCCESS to `REVIEW_REQUIRED` only. No public webhook route, customer checkout, UPI QR, or live payment initiation is exposed. Caller must later durably deduplicate delivery IDs.
8. Billing Vitest test discovery integrated with blocking `prebuild` (`vitest.config.mts` and `npm run test:billing`). Vercel logs for commit `107c59d75ed8efeab624d572e78aa1a3833f27be` confirm 10 test files passed / 66 tests; later receipt snapshot regression cases are included in subsequent builds. Database integration / browser E2E tests still NOT executed.

## Review-only SQL application order (NOT executed)

- `docs/billing/012_billing_private_review.sql`: private schema, RLS default-deny, invoice origin, unique source event, append-only verified receipt snapshots and immutable trigger.
- `docs/billing/013_invoice_create_rpc_REVIEW_ONLY.sql`: atomic invoice creation and numbering.
- `docs/billing/014_slice_settlement_rpc_REVIEW_ONLY.sql`: serialized booked Slice credits, duplicate UTR guard, audit, atomic PAID receipt snapshot insertion.
- `docs/billing/015_admin_invoice_read_rpc_REVIEW_ONLY.sql`: private admin invoice reads plus stored receipt-snapshot retrieval.

All SQL runs only after the **correct CredoNomics Supabase project** is identified and backups, role grants and recovery validated. The currently connected Supabase project is **CardLedger**; do NOT apply CredoNomics Billing SQL to CardLedger. Vercel preview Supabase env binding is not independently verified as the intended production database.

## Feature flags: defaults OFF

- `BILLING_API_ENABLED=true`: open internal billing API routes (still authenticated).
- `BILLING_PORTAL_ENABLED=true`: permit hosted admin portal (still authenticated).
- `BILLING_WRITE_ENABLED=true`: permit admin issuance.
- `BILLING_SETTLEMENT_ENABLED=true`: permit manually verified Slice credit recording.
- `BILLING_SYSTEM_ENABLED=true`: allow trusted server-only automatic invoice calls.
- `BILLING_ADMIN_USER_IDS=<approved Supabase auth UUIDs>`: private, comma-separated allowlist.
- `BILLING_SYSTEM_ACTOR_ID=<dedicated audit actor UUID>`: for trusted system event audit.
- Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and **server-only** `SUPABASE_SERVICE_ROLE_KEY` must point to the reviewed CredoNomics DB. Never use CardLedger secrets or expose service keys via `NEXT_PUBLIC_`.

**Do NOT set these flags yet.** A feature flag alone does not constitute secure launch approval.

## Critical blockers before real customer access or payment collection

1. Connect and confirm the **CredoNomics** Supabase project; execute reviewed migrations on correct environment; verify RPC and rollback on the real database.
2. Configure actual allowlisted operator's trusted Supabase app metadata and test unauthenticated, IDOR, request-forgery, admin access, duplicate invoice and concurrency cases.
3. Supply and validate official invoice issuer/legal name, address, tax registration status, GST fields if applicable, financial/document retention policy and correct line-item terms.
4. Implement **real server-verified WhatsApp OTP**, with rate limiting, expiry, reuse prevention, privacy and provider legitimacy. No mock OTP or public invoice lookup.
5. Validate actual YouPI runtime contract, replay-protected signed event observation, exact server-side payable amount and beneficiary name on QR. No gateway SUCCESS may mark PAID.
6. Independent booked Slice credit evidence remains the only settlement source; validate actual statements and duplicate reference handling.
7. Implement **immutable PDF binary generation and storage**, PAID receipt archiving/delivery and original UNPAID PDF preservation. The database now includes a versioned append-only PAID receipt **data snapshot**, not a generated PDF binary. Browser 'Print/Save PDF' is not server-side immutable file issuance.
8. Billing unit tests now run during builds. Still run SQL transaction/rollback and race tests on the correct CredoNomics DB, authenticated browser tests, mobile UI, and print/PDF visual regression against the approved sample invoice. Do not infer those PASS merely from a Vercel READY build.
9. Confirm free-tier quotas and storage/OTP hosting costs remain strictly ₹0. Don't provision paid resources.

## Explicitly prohibited today

No production release/merge; no use of CardLedger database; no live UPI/payment sessions; no public customer invoice retrieval; no mock OTP; no PAID receipt based on YouPI/SMS/Gmail alone; no changes to bank beneficiaries or public payment endpoints.

## Upstream

- Invoify: https://github.com/al1abb/invoify (MIT). Its current PDF engine depends on headless Chromium; full upstream component/PDF stack is **not** imported into this Next.js 14 project.
- YouPI-PG: https://github.com/gxurav1710/YouPI-PG. Its README documents HMAC raw-body webhook signatures; this project only implements an observation-only verifier until verified runtime integration is safe.
