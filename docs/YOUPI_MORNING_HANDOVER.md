# CredoNomics x YouPI — Morning handover checklist (18 Oct 2026)

IMPORTANT: This is a DRAFT-ONLY integration. No public payment gateway, bank confirmation or live payments have been enabled. CredoNomics production branch main remains unchanged.

## Verified work completed

- GitHub repo aqdas1820/credonomics-site; Vercel project credonomics-site.
- Draft PR: https://github.com/aqdas1820/credonomics-site/pull/1
- Preview-only route /pay, informational with no payment/OTP forms and robots noindex.
- Uploaded sanitized source bundle reviewed: 94 entries, BridgeKit/Payment Pilot limited to local contract/mocks, no independent bank confirmation.
- Website fixture-only adapter and negative unit tests present; does not make live requests or change invoice status.
- Updated /pay CSS with responsive bounds for small devices, wrapping, minimum tap size and focus states, plus Playwright regression source tests for phone/tablet/desktop, light/dark, noindex, no payment controls.
- Operator screenshots confirmed localhost services 6100, 7000, 6001 reachable, 6100 and 7000 HTTP 200 UP. Observer processes 6002 and 6003 HTTP 200 but isRunning:false. UPI readiness indicator RED (smsHealthy:false, gmailHealthy:false). Merchant dashboard screenshot showed an active *False Narrative GREEN* test override. That is not evidence of banking readiness.

## Morning manual actions, highest priority first

1. In YouPI Merchant Dashboard (http://localhost:6001) open Developer & Infrastructure Hub, then UPI Server Health: False Narrative Switch. Click **Off (Live)**. Leave Test Mode off. Screenshot the genuine observer status only, redacting sensitive IDs, secrets and account details.
2. Tell us which system holds REAL CredoNomics invoice records: Khatabook, CredoNomics backend, Supabase or manually-created PDFs. Provide one sanitized sample invoice identifier, amount, expiry state and authorized data source, with customer details redacted.
3. Define operator-authorized manual Slice Passbook review. Who may verify a booked bank credit and record auditor identity/time? Decide handling of UTR, amount/receiver mismatches, duplicate credits, refunds and disputed amounts. Never mark PAID based on gateway SUCCESS, OTP, QR, SMS, Gmail or screenshots.
4. If automatic observer status is desired, inspect Merchant Dashboard → Daily Merchant Operations → Payment Observers Status: SMS pairing, Gmail login and active polling. For manual bank review, observers are not necessary, but YouPI's existing GREEN label requires their readiness and should never be spoofed.
5. Decide hosting architecture. Windows localhost services are not reachable from the public Vercel deployment. A reviewed persistent HTTPS host and authenticated backend-to-gateway path are needed. DO NOT expose raw merchant/admin API via a public tunnel. Maintain strictly ₹0 cost and seek approval before external infrastructure creation.
6. Capture screenshots or a short recording of each remaining PREVIEW UI glitch at 100% zoom, one mobile and one desktop viewport, specifying the broken section and light/dark appearance. HTML smoke checks cannot certify an entire site's visual layout. Payment preview responsiveness has been hardened, but no claim that all site glitches are fixed.
7. Run full original runtime tests locally when ready: the sanitized upload omitted original YouPI runtime fixtures and selected UI/static assets. Export-only test results were BridgeKit 124/128 and Pilot 394/397; rerun failing subsets in actual complete source environment before a full-pass claim.
8. Open draft PR #1 to inspect changes and the Vercel preview. Do not merge to main or promote to production.

## Technical release gate (NOT passed)

- Authenticated trusted invoice server record; precise INR paise amount and merchant/payee binding; customer access checks.
- Reviewed secure public HTTPS gateway and persistent data store that can actually be reached by a server-side service.
- WhatsApp OTP mandatory and secret-safe logs.
- Validated webhook with exact transaction binding, replay and duplicate resistance.
- Manual booked Slice credit review is independent of gateway statuses and performed by an authorized reviewer before PAID; unavailable evidence always keeps PENDING/REVIEW_REQUIRED.
- No public admin exposure, deceptive trust indicators, simulation override, chargeable service or unapproved production switch.

Known limitation: fixture-only adapter cannot take real payments. Vercel READY means web build readiness, not independent bank settlement proof.
