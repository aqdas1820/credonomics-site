# Phase31 direct UPI pilot — NOT LIVE

This branch adds an independent direct-UPI checkout with explicit manual official-bank review. It does not run or commercially license YouPI, simulate bank APIs, collect payments automatically, or turn app/gateway success into a receipt. All new activation flags default OFF. No hosted migration, Auth grant, production deployment, DNS change, secret rotation or real payment is authorized by this document.

## Verified starting state, 20 October 2026

- Parent: Phase30 `112158204df6693a7fc4b3dcae7dc90b5a5cbfee`; Draft PR #11 targets Phase29. Draft #10 targets #9, which targets Phase26. All three remain open/unmerged. Do not merge them blindly or target this delta directly at main.
- Connected project `jvpiulmcjjnsgozgqgzw`: `credonomics-staging`, organization `ewesdskrqxonchucazyr` / `CredoNomics Staging`, Free plan, `ap-south-1`, PostgreSQL `17.6.1.171`, ACTIVE_HEALTHY. API access and organization identity were verified; legal ownership and designation as a production database were not established.
- Zero Auth users, confirmed users, billing-admin metadata users and sessions. Google/email enabled; phone/anonymous disabled. Actual owner Google login and admin/non-admin hosted acceptance have not occurred.
- No `billing_private` schema or billing RPCs. Only migration versions 20260902, 20260928, 20260929, 20260930. Existing public application tables have RLS and owner predicates; the IPO reference read is public by design. Zero Storage buckets/objects.
- Advisor reports public EXECUTE grants on the existing SECURITY DEFINER `rls_auto_enable()` event-trigger function. Its event trigger and search_path were inspected. This is a grant warning, not a demonstrated arbitrary-call exploit. The new review-only SQL revokes those grants without removing automatic RLS.
- Vercel environment metadata, read without decryption, shows Supabase URL, publishable key and service-role configuration for preview only. Production has no Supabase variables in this project's returned inventory (`hiddenProductionEnvCount=0`). No secret values were retrieved. Production account plan/commercial entitlement was not supplied by the available team metadata.
- AWS checkout remains PHASE29_SYNTHETIC / UPI-only / livePayments=false. Source at `/opt/youpi` is clean at `e123465961adc42800f3e44671767b39db1aeda3`; running gateway image is `sha256:51a3c5ffefb86f67ec965a96bd00d7d818c902ddc1029521c234e41a04cd09df`, healthy. No root LICENSE in that checkout, and public upstream LICENSE lookup returns 404. Commercial permission and full deployed dependency clearance remain unestablished. The existing termination schedule targets 27 October 2026 01:38:48 IST.

## Implemented journey

1. Existing Supabase-verified, app_metadata-authorized, UUID-allowlisted administrator creates an immutable UNPAID invoice using existing billing APIs.
2. Private invoice page prepares or recovers one durable manual UPI intent. Browser amounts, VPAs, invoice overrides and COD are rejected. Invoice row locks prevent competing YouPI/manual instructions. Issuance is limited to 10 requests/operator/minute.
3. Domain-separated HMAC link contains only intent ID and issuance time. The 24-hour link revalidates signature, database scope, persisted intent, current beneficiary fingerprint and canonical invoice state on every view. Revocation and 30 views/intent/minute are database-enforced. No process-memory financial state.
4. Standalone HTML renders an inline QR locally and an explicit UPI deep link with exact INR amount, configured beneficiary and intent reference. No external QR service, page scripts, analytics, Auth cookie refresh or customer PII. A UPI app may allow amount/reference changes; a QR cannot prove bank receipt or guarantee the bank preserves the reference.
5. Only an authenticated authorized operator can record a booked credit after personally checking the official Slice bank record, receiving account, exact amount, UTR and intended invoice. This is human attestation, not automated bank reconciliation. The current ledger supports Slice only; other-bank configuration is rejected rather than mislabeled.
6. SQL binds that review to the intent/beneficiary, rejects partial/wrong/duplicate/conflicting credits and guards the legacy settlement function against bypass. An atomic transaction records evidence, finalizes PAID and snapshots exactly one receipt. Identical retries acknowledge the same settlement. Revoked/expired instructions cannot display QR; an authorized operator can still review an actual late credit.
7. A PAID public view removes payment instructions. Existing authenticated private receipt/PDF endpoints remain the receipt delivery path; no automatic customer messages are sent.

## Database order and non-destructive rollback

Required order: `012` → `013` → `014` → `015` → `016` → `PHASE28_LINK_LEDGER_REVIEW_ONLY.sql` → `017` → `supabase/migrations/20261020144859_manual_upi_pilot.sql`.

`node scripts/prepare-billing-pilot-sql.mjs` prints exact source hashes. `--write <NEW_REVIEW_FILE>` creates a private review bundle; it never connects to a database. The bundle runs all eight scripts in one transaction and refuses any pre-existing billing schema. **Do not run blanket `supabase db push`: the legacy prerequisites are review SQL outside the migrations directory.** Existing billing deployments require a separately reviewed incremental migration, not this bootstrap.

Before ANY hosted application: independently confirm organization/project/environment, capture a full recoverable backup via the owner's supported secure database connection, test restore to an isolated matching Supabase/Postgres environment, preserve Auth/provider settings separately, and obtain explicit owner approval of the target, exact bundle hash and changes. Current zero users/buckets is not a backup. No hosted backup was exported or restore-proven in this sprint.

Free-plan recovery: Supabase recommends independent CLI exports; do not assume a downloadable managed backup or PITR entitlement. Keep schema/data/role exports encrypted and outside GitHub. Never paste passwords, connection URIs, access tokens or dump contents into chat. Use secure local credential handling; do not reset credentials to obtain access without separate approval. Storage object files need separate backup if buckets are later added.

Rollback: disable `MANUAL_UPI_ENABLED`, pilot/settlement/other activation flags through the approved configuration interface, restore the previous approved source deployment, and revoke affected intent links through the authorized admin API if required. Preserve all invoices, bank evidence, reviews, receipts and audit history. Do not drop schemas, delete financial rows, rewind a production database or disable immutable triggers. Restore drills run only in disposable test databases.

## Owner-only prerequisites and first-payment pilot

- Confirm the staging project belongs to the authorized business and approve its intended use. Identify/approve the actual production database independently.
- Supply a verified recoverable backup through a secure supported interface; approve the exact hosted migration only after its restore check.
- Complete real owner Google login; separately approve `app_metadata.billing_admin=true` and the matching server UUID allowlist. Validate owner/non-owner access in an approved preview. No arbitrary user is promoted by this branch.
- Verify merchant authority and the actual beneficiary VPA, exact receiving name and controlled Slice account. Enter these via approved server configuration; do not send UPI PINs, OTPs, bank credentials or secret keys in chat.
- Approve an existing host with permitted commercial use, adequate capacity, verified zero additional spending and rollback. This manual path needs Next.js plus Supabase, not AWS/YouPI. Vercel Hobby permits noncommercial use only; account eligibility is currently unverified. Railway existing usage is not a zero-cost guarantee. Cloudflare/OpenNext is a documented alternative requiring a separate compatibility/budget test, not a deployment claim.
- Configure the production/preview Supabase scope and server keys securely; install a separate manual-link signing key. No automatic production secret rotation. Keep all activation flags OFF until the corresponding approvals exist.
- Separately authorize the exact release, pilot invoice/amount, merchant account and who verifies bank credit. Then run one owner-controlled payment, inspect the actual booked bank credit independently, record the exact evidence once, inspect receipt/PDF and absence of duplicate credit. Do not invite customer payments before that acceptance passes.

## Reproducible verification

- `npm test`; `npm run typecheck`; `NEXT_TELEMETRY_DISABLED=1 npm run build`.
- `BILLING_PG_DISPOSABLE=1 ... python3 scripts/test-billing-postgres.py`: native PostgreSQL 17 financial, replay, manual-review, concurrent UTR/intent/receipt tests. With the disposable CI container it also checks atomic bootstrap rollback and pg_dump/restore digests for seven ledger tables.
- `npx playwright test --config=playwright.manual-upi.config.ts`: desktop/mobile rendering, independent decoding of the rendered QR, no external requests, PAID instruction removal and built disabled-route denials. No UPI app launch or real transfer.
- Authoritative native/browser results are the Phase31 Draft PR workflow checks. Local Chromium download failed in this workspace; use the CI result rather than claiming a local browser pass. Synthetic attestation tests are not evidence of real bank reconciliation, hosted Auth acceptance or a hosted recovery backup.

Sources: [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups), [Vercel commercial-use terms](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage), [Cloudflare Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [QR generator source](https://github.com/soldair/node-qrcode).
