# CredoNomics → YouPI invoice share link (development only)

Date: 2026-10-19. **NOT LIVE FOR COLLECTION.** Adds a real invoice-to-session-to-link workflow on top of the Phase 26 adapter, but all financial operations remain default-disabled. Do not merge/deploy or set approval flags from this change alone.

## Operator journey (when separate production approval gates pass)

1. An authorized CredoNomics billing operator issues a real UNPAID invoice in the private /billing page using the trusted server-side invoice RPC, not a client-chosen amount.
2. The operator clicks Generate private payment link on a newly issued invoice or its private historical invoice page. The existing authenticated POST /api/youpi/admin/invoices/{uuid}/session loads that invoice from the server, checks zero bank credit, creates/recovers a YouPI session, verifies exact merchant/order/INR amount/checkout-origin, and returns an HMAC-protected share link with 72-hour expiry.
3. The link has form https://www.credonomics.in/pay/i/{signed-token}. The token contains invoice UUID, invoice number, payment UUID, merchant UUID, exact paise, timestamps; NO customer name, address, email, phone or bank detail. Treat as a **bearer URL**: send only to intended customer, not as proof of WhatsApp OTP.
4. The customer page checks release flags, signature, expiry, expected merchant, and re-reads current private invoice via service-role RPC. It requires identical UNPAID, zero-bank-credit amount/number. It also performs read-only YouPI status GET matching signed order, amount, currency and payment ID in nonterminal state. Any mismatch, offline API, wrong key, missing database: HTTP 404, never a QR.
5. Only then does the page show invoice number and amount and a Proceed to YouPI checkout link pointing to the separately approved gateway HTTPS checkout.
6. No bank payment is initiated by opening link. No webhook, bank settlement, paid receipt, automatic email or WhatsApp is created by this change.

## Configuration (all approval flags OFF until independently confirmed)

- Secure configured owner Supabase Auth, allowlisted billing admin UUID and trusted app_metadata.billing_admin=true.
- Approved private billing database migration and scope validation, and existing server-only Supabase service-role credential. Existing BILLING_PORTAL_ENABLED, BILLING_API_ENABLED, BILLING_WRITE_ENABLED require separate owner approval and independent live testing.
- YOUPI_API_ORIGIN and YOUPI_CHECKOUT_ORIGIN must resolve to independently approved remote HTTPS gateways; localhost/127.0.0.1 are not production hosts.
- YOUPI_MERCHANT_ID must correspond to legitimate verified merchant, not a demo fallback.
- YOUPI_PUBLIC_SITE_ORIGIN=https://www.credonomics.in.
- YOUPI_PAYMENT_LINK_SIGNING_KEY must be a dedicated random 32-byte key encoded in 64 lowercase hex chars, injected server-side only. Never commit, log, send or expose via NEXT_PUBLIC_. Losing/rotating the key invalidates existing links.
- Set YOUPI_BRIDGE_ENABLED, YOUPI_PAYMENT_LINK_ENABLED, YOUPI_SESSION_CREATION_APPROVED, YOUPI_LICENSE_CONFIRMED, YOUPI_SECURITY_REVIEW_APPROVED only after evidence and separate explicit owner approval. Default OFF today.
- Settlement and automatic email/WhatsApp remain OFF; never equate YouPI SUCCESS or an observer SMS with bank-credit confirmation.

## Production blockers — NO GO

- Upstream YouPI describes itself as experimental; commercial licensing/rights and open payment-security issues remain unresolved.
- Owner's local merchant currently uses original demo merchant UUID 00000000-0000-0000-0000-000000000001 with CredoNomics branding. Active VPA and Payee Display Name are not independent bank beneficiary proof.
- Webhook HMAC secret was visible in an earlier screenshot. Rotate before any webhook activation; do not share new key. Signed events need durable replay-safe reconciliation against actual bank credit.
- Remove unverified checkout badges such as Trusted Business, 500+ orders, 100% Protection before public use.
- Production Auth and private billing are still unconfigured. No owner/non-owner acceptance and no end-to-end bank settlement/notifications.
- Signed bearer URLs alone do not offer OTP verification; a leaked link can be used by its holder. Server-side durable abuse/rate limits and audit remain pending. Do not enable until verified.
- No PDF invoice upload/import implemented; existing system creates structured invoice records. Customer email and WhatsApp automatic delivery remain pending.
- Never forward a local admin server, expose a public localhost tunnel, or provision infrastructure or paid services without approval. A Vercel production app cannot reach the owner's localhost.

## Tests

npm test -- src/lib/billing/youpi-payment-link.test.ts
npm run typecheck
npm run build
node scripts/check-billing-launch-readiness.mjs --assert-blocked

The owner's genuine local bridge test passed: CredoNomics connector to local YouPI created one INR 1.00 INITIATED session and verified status; no transfer. Do not create duplicate sessions merely to test signing links. No current claim of a working public customer payment URL.

Changes use current project dependencies and no new paid resources.
