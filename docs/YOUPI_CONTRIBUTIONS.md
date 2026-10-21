# Existing support popup → existing YouPI

Status: implemented on an isolated integration branch; **not live-payment enabled**. The existing popup remains an email fallback until both website operator approval and gateway acceptance gates pass. No popup CSS, amounts, timing, dismissal storage, dialog structure, branding or gateway design was changed. The active CTA and notice text change only when the server reports availability.

`SupportCredonomics.tsx` checks the same-origin availability route. When available, its existing anchor calls `/api/contributions` with the selected amount and a retry nonce, then navigates to the returned URL. When unavailable, the original mailto/dismissal behavior remains. Creation failure also falls back to the original mailto. No email is interpreted as proof of payment. No new checkout, observer, tunnel or gateway was created.

The Node server validates JSON, canonical Origin, nonce, and an exact numeric ₹10/₹100/₹500 allowlist. It derives a merchant-scoped HMAC order ID from the nonce and amount, keeping retries stable and separate intentions distinct. It calls the existing private `POST /api/v1/payments` using server-only merchant credentials, with INR/UPI and contribution metadata. Amount, currency, order and exact canonical order-specific checkout URL must match the response. Beneficiary/receiving-account selection and QR generation remain entirely with YouPI. Creation is limited to 20 attempts per server process/hour, ignoring forwarded IP headers; before production approval, apply the website host's durable rate limit as well, since process limits reset on restart and do not span instances.

The only contribution-success response is from `/api/contributions/confirmation`. It accepts a signed HttpOnly/Secure/SameSite=Strict receipt cookie, then reads the exact order through the authenticated private Core API. It requires matching amount, currency, method, order and contribution metadata, Core SUCCESS/internal SUCCESS, verificationLevel ≥ 1, GMAIL verification source and completedAt. Redirect queries, browser events, unsigned emails and a bare SUCCESS without verification remain insufficient. The gateway remains authoritative; its existing durable payment order is the record, with no parallel merchant payment engine or locally fabricated evidence. No new success UI is added to the popup. A future UI consumer must use this server confirmation route. No webhook destination or merchant setting was changed.

## Server configuration (leave disabled now)

```dotenv
YOUPI_CONTRIBUTIONS_ENABLED=false
CONTRIBUTIONS_SITE_ORIGIN=https://credonomics.in
YOUPI_PRIVATE_CORE_URL=http://127.0.0.1:6100
YOUPI_MERCHANT_ID=
YOUPI_MERCHANT_KEY=
```

Use the existing merchant's ID and merchant authorization secret through the website host's approved server-secret mechanism; never NEXT_PUBLIC variables, browser scripts, git, chat or email. This code does not read or migrate the gateway's encryption keys. The API key is used only in private Core headers and receipt/order MACs.

`127.0.0.1` means **the website's server**, not the owner's Windows PC. This implementation permits only loopback Core port 6100. A separately hosted website cannot reach Windows Core by setting localhost or substituting `https://pay.credonomics.in/api/v1/payments`; the public checkout correctly denies that route. No existing private website→Windows Core transport was found in the website source. Before enabling, the existing website backend must have an authorized private Core connection (the current implementation supports a backend on the same host). Any different private transport requires review/explicit URL validation changes; do not expose 6100 or add merchant API routes to the public checkout as a shortcut. No new transport was provisioned.

## Exact current blockers

Read-only live check: public original Checkout reports collectionEnabled=false and otpDeliveryEnabled=false. Its bank acceptance is still unresolved: verified receiving-VPA linkage to Slice Current Account XX5355, authenticated genuine UPI-credit template/account binding, and operational Gmail submission are separate gateway gates. The existing Slice date-only IMPS/unknown templates remain review-only. This integration neither changes nor bypasses those decisions.

Additionally, this branch has no production website merchant credentials or verified private Core transport configured. Leave website contribution approval false. Only after original gateway financial acceptance, usable customer authentication, private website connectivity, server credential provisioning and durable request limiting are approved should an operator enable the website flag. The handler also independently requires the original public portal's collection and OTP health flags true and production/private Core health before it can issue a creation POST. Health alone is not operator authorization; the website flag is a separate explicit gate.

## Validation and review

- 92/92 unit tests passed across 18 files, including 23 contribution/button tests; `npm run typecheck` passed using the repository lockfile's dependencies installed offline.
- Actual existing popup click handlers tested for all three amounts, selected JSON amount, returned URL navigation and original dismissal; disabled fallback creates no request.
- Isolated server transport tests verify distinct order-specific URLs, retry identity, unsupported amounts, cross-origin/extra fields, closed flags, private URL validation, wrong upstream amount/redirect, signed receipts, pending/unverified results and rate limits. All gateway/network responses were fixtures; no real session or QR was created.
- Popup CSS and `support-logic.ts` are unchanged. Existing working repositories/design branches were not edited; branch starts from main commit `94908357e4525f6197191843ade8e3d8ca794d0e`.
- No deployment, service restart, Cloudflare change, actual mail/message, bank observation, credential or financial-record modification occurred.

Before merging with continuing design work, apply only the action wiring in the component if its markup has moved; retain the new server/client modules and tests. Do not replace a newer version of the popup wholesale. Rollback is reverting this integration commit; because the original fallback remains, no payment/data migration is involved. Live click-through with genuine sessions and genuine bank-confirmed contribution success remains **blocked and unverified**; test URLs are synthetic, not real payable links.
