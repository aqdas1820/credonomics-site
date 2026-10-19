# CredoNomics Billing — Phase 15 integration and database gates (2026-10-18)

**Environment:** branch `feature/youpi-payment-entry-prelaunch` only. Do not merge to `main`; production and live payment collection stay disabled. Zero paid provisioning.

## Implemented

- A signed YouPI merchant webhook parser using the documented `X-Gateway-Signature: sha256=...` of HMAC-SHA256 over the **raw JSON body**. The published merchant guide does not require timestamp or delivery-ID headers; we removed those invented mandatory headers. Validate currency INR, exact decimal amount vs paise, mandatory UTR on SUCCESS and safe payload limits.
- All gateway outcomes, including SUCCESS, yield only `REVIEW_REQUIRED`. A bank credit can be marked booked only by a separate allowlisted operator attestation after checking the official Slice statement; gateway events cannot call the settlement RPC.
- A **review-only** YouPI observation ledger `016_youpi_observation_rpc_REVIEW_ONLY.sql` with unique (paymentId,event) and raw body SHA-256 anti-replay, private schema, RLS, append-only trigger, invoice-number and amount matching, and audit. No HTTP webhook is enabled.
- A server-only `recordSignedYoupiObservation` adapter, gated behind `BILLING_API_ENABLED`, `BILLING_YOUPI_OBSERVATION_ENABLED`, a server-only webhook secret and explicit approved DB scope.
- All invoice admin pages, admin REST routes, automated trusted-event issuance and the YouPI adapter require **BILLING_EXPECTED_SUPABASE_PROJECT_REF** matching `NEXT_PUBLIC_SUPABASE_URL`. Without that reference they refuse all database reads/writes, even if someone accidentally enables feature flags.
- Previously implemented draft workflow: admin invoice creation, automatic server-only creation, private invoice history, bank-credit review, atomic settlement, and append-only PAID receipt snapshot. PDFs remain browser-printable, not server-archived.
- `012_billing_private_review.sql`, `013_invoice_create_rpc_REVIEW_ONLY.sql`, `015_admin_invoice_read_rpc_REVIEW_ONLY.sql` were corrected after discovering damaged function boundaries/duplicate invoice RPC text. Static migration tests now enforce paired PostgreSQL `$$` quoting, one transaction per file, one create-invoice function, RLS and separation of gateway observations from bank credit.
- Billing Vitest tests are mandatory during `prebuild`, and prior Vercel run confirmed 11 files / 84 passing tests. Later SQL tests add more coverage; check latest deployment logs for final count. A green Vercel build **does not mean** the SQL has been applied or PostgreSQL/RLS/checkout E2E has been tested.

## Manual blockers

1. In ChatGPT's Supabase plugin, the accessible project list currently includes **CardLedger only**. Connect or grant scope for the correct **CredoNomics** project. Do not use CardLedger. Do not create a paid Supabase project or branch.
2. Independently verify the CredoNomics Supabase Free project ID, owner, API URL, service role permissions, backup/rollback and intended Vercel environment; only then configure `BILLING_EXPECTED_SUPABASE_PROJECT_REF` and execute 012→016 in reviewed order on that specific database.
3. Confirm official invoice issuer name, address, GST applicability/registration, service description and terms; do not invent a tax invoice.
4. Review operator Supabase UID allowlist plus trusted `app_metadata.billing_admin`, test denied routes, CSRF, read access, concurrent invoices, duplicate UTR and duplicate webhook payments on the approved database.
5. Provide/approve legitimate **real WhatsApp OTP verification** for customer invoice lookup, with expiry, rate limits, one-use proof, no mock credentials and privacy checks. YouPI's pre-checkout OTP should NOT be assumed to authorize viewing invoices outside checkout without a verified server-side proof contract.
6. Test licensed YouPI runtime, legal usage rights, beneficiary account/VPA, checkout amount binding and actual observations end-to-end. No live payment activation before security review; the upstream repository documents commercial/sovereign licensing, so its license terms require verification before copying source.
7. Implement real immutable **PDF file** generation/storage with versioning and retention; a PostgreSQL JSON snapshot and print-as-PDF are not equivalent to archival PDF binaries.

## Launch gate

All hosted features stay disabled by default. `BILLING_API_ENABLED`, `BILLING_PORTAL_ENABLED`, `BILLING_WRITE_ENABLED`, `BILLING_SETTLEMENT_ENABLED`, `BILLING_SYSTEM_ENABLED`, and `BILLING_YOUPI_OBSERVATION_ENABLED` must not be enabled until each dependency is independently verified. `BILLING_YOUPI_WEBHOOK_SECRET` must remain server-only. Do not put any service key or private customer data in `NEXT_PUBLIC_*` or logs.

Upstream merchant contract: https://github.com/gxurav1710/YouPI-PG/blob/main/docs/MERCHANT_INTEGRATION.md

Upstream OpenAPI: https://github.com/gxurav1710/YouPI-PG/blob/main/openapi.yaml

Invoify (MIT): https://github.com/al1abb/invoify — inspiration and compatibility reference; source/components are not wholesale imported.
