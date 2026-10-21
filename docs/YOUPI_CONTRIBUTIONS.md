# PR #16: existing YouPI secure contribution connection

**Source implemented; not deployed or payment-enabled.** Follows https://github.com/aqdas1820/credonomics-site/pull/16#pullrequestreview-5598371157. No website/checkout CSS, layout, colors, prompt timing or dismissal behavior changed. Confirmation uses the existing status paragraph.

## Minimal transport and threat boundary

Browser -> existing website /api/contributions -> ONLY POST https://pay.credonomics.in/api/v1/merchant/contributions -> existing Windows Checkout (7000) -> loopback Core (6100). Vercel localhost dependency is removed. The existing standalone checkoutUrl is used for top-level navigation. No iframe, new service/domain/tunnel, generic proxy or public Core endpoint.

One fixed RPC supports readiness/create/status. Merchant and website origin are bound in the signed JSON body. Headers X-Youpi-Timestamp, X-Youpi-Nonce and X-Youpi-Signature authenticate HMAC-SHA256 over POST, exact path, timestamp, nonce and raw-body SHA256, separated by newlines. Timestamp tolerance is 60 seconds. Gateway ALSO requires the unchanged validated Cloudflare tunnel-origin metadata. The tunnel secret is separate and never copied to Vercel. Existing published-host routing carries the path after a separately approved source reload; no Cloudflare change was made. Reference: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/

Gateway rejects browser Origin/Sec-Fetch-Site/cookies, bad/stale signatures, replay, extra fields, path/query aliases and unsupported operations/amounts. No CORS permissions. Body limits and existing global/IP budgets remain. A separate operational SQLite journal enforces 120 authenticated requests/minute, 20 create attempts/hour and 100/day across website instances and Windows restarts. It prunes expired transport nonces after 48 hours, retaining order/ambiguity history. It never creates its schema in the financial database.

Both sides allow only numeric INR 10/100/500. Gateway recomputes merchant/attempt/amount-bound order IDs. A single existing active, enabled merchant-owned receiving account must match approved ID and VPA hash. Current merchant credential must match the approved rotated fingerprint, distinct from the revoked fingerprint. It rechecks the actual Core-created payment/amount/beneficiary mapping before returning the canonical URL. No supplied beneficiary, customer identity, amount override or auto-activation is forwarded. Original QR generation, receiving account, verification and state machine remain unchanged.

Reservations are durable BEFORE Core transport. Completed retries return the same validated result. A timeout/crash leaves UNCERTAIN and never automatically re-POSTs creation. Operator reconciliation must inspect the existing Core merchant/order record before recovery; do not delete ambiguity records or fabricate replacement payments.

## Authentication and confirmation

Installed fork: password login exists privately in Core but is not exposed by the hardened public facade. Original public checkout uses OTP sign-in. Gateway currently reports WHATSAPP_OTP only when that implemented path is enabled; otherwise anonymous contribution creation remains unavailable. Vercel no longer independently requires OTP from public health. Another mode requires an actually implemented/reviewed public auth path, never a bypass.

Website signs an HttpOnly/Secure/SameSite=Strict receipt containing payment/order/amount/attempt/expiry. /api/contributions/confirmation validates it and calls the authenticated RPC status operation. Gateway requires ownership in its completed-order journal, matching Core financial record/metadata, INR/UPI, merchant/account/amount, SUCCESS, verificationLevel >=1, GMAIL source and completedAt PLUS an attributed same-payment/account/amount Gmail observation with bank reference. Browser redirect/query, unverified email or connectivity alone cannot establish success. Existing confirmation remains readable when new collection is paused.

Popup consumes this server result in its existing status paragraph. Pending polling is bounded to 12 checks at five-second intervals; absent receipt/unavailable responses stop it. It does not open/dismiss the popup or change its timing. No new success page/UI was added.

## Closed settings and credential remediation

The encryption-master migration did NOT rotate the previously exposed merchant webhook secret. Coordinated approved rotation must preserve existing encrypted records and webhook consumers. This follow-up performs no live credential read/decryption, rotation, generation or record write. Provision a fresh independent 32-random-byte/64-hex contribution secret through approved server custody; never reuse webhook/master/tunnel secrets or put it in NEXT_PUBLIC, git, chat or browser code.

Website server settings: YOUPI_CONTRIBUTIONS_ENABLED=false, CONTRIBUTIONS_SITE_ORIGIN=https://credonomics.in, YOUPI_MERCHANT_ID and YOUPI_CONTRIBUTION_SECRET (unset pending approved provisioning). YOUPI_PRIVATE_CORE_URL and YOUPI_MERCHANT_KEY are no longer used.

Windows settings: CHECKOUT_CONTRIBUTIONS_ENABLED=false; CHECKOUT_CONTRIBUTION_CREDENTIALS_APPROVED=false; leave CHECKOUT_CONTRIBUTION_SECRET, CHECKOUT_CONTRIBUTION_MERCHANT_ID, CHECKOUT_CONTRIBUTION_ACCOUNT_ID, CHECKOUT_CONTRIBUTION_VPA_SHA256, CHECKOUT_CONTRIBUTION_ROTATED_MERCHANT_KEY_SHA256 and CHECKOUT_CONTRIBUTION_REVOKED_MERCHANT_KEY_SHA256 unconfigured pending reviewed custody/rotation/account evidence. CHECKOUT_CONTRIBUTION_SITE_ORIGIN defaults to https://credonomics.in. The new and revoked hashes must differ; current encrypted merchant secret is checked against the approved new hash at runtime. Operator pins are reviewed evidence, not automatic proof of historical key custody.

Windows retains its existing protected master key/database and local observer service credential. None is copied to Vercel. Local privileged credential is used only for hardcoded Core health/create operations; destinations, paths and request headers are never forwarded arbitrarily. Operational journal is data/contribution-adapter.sqlite under the existing protected data directory.

## Exact remaining gates / no deployment

1. Approve/complete exposed webhook-secret remediation and provision the independent signing secret plus merchant/account/hash pins. No master-key migration repeat.
2. Pass original financial acceptance: independently verified receiving VPA to Slice Current XX5355, authenticated genuine UPI-credit template/account binding, operational Gmail verification and usable public login. Existing date-only IMPS/unknown templates remain review-only.
3. Review gateway source delta, then separately approve source publication/controlled Checkout-only reload and website merge/configuration. Current technical review explicitly requires NO deployment/live-money activation. Do not restart Core or expose 6100 as a shortcut.

Read-only public check: original Checkout collection=false, OTP=false; new RPC GET returns 404. New source is not loaded; email fallback remains. No service, environment, tunnel route, bank record, OAuth or WhatsApp session was changed.

## Tests and artifacts

- 94/94 website unit tests and website typecheck pass.
- 47/47 gateway/security/integration tests, zero skips in the explicit cross-repository run, and gateway typecheck pass.
- Actual website TypeScript handler connected over isolated HTTP to the existing CheckoutServer with synthetic tunnel metadata and stubbed Core. All three amounts returned distinct order-specific URLs. Fake settled-looking status without attributed bank evidence remained PENDING. No real session, QR, observation, message or transfer was created.
- Covers three amounts, real popup handlers, disabled fallback, private/public route denial, CSRF/CORS/tunnel trust, credential leakage, merchant/account/VPA pins, replay/rate persistence, ambiguous creation, signed receipt and confirmation consumer/status display.
- Gateway implementation is local at D:\CredoNomicsProject\youpi-pg. docs/youpi-gateway-contributions.patch contains ONLY this follow-up delta against the installed hardened fork; do not apply twice. Unrelated existing repairs are excluded. The upstream gateway remote was not pushed/overwritten.
- Cross-repo command from gateway (Node with native TypeScript support): set YOUPI_WEBSITE_SOURCE=D:\credonomics-site-youpi-contributions and NODE_ENV=test, then node --test apps/checkout-portal/src/__tests__/contribution-website.integration.test.js.

Rollback source delta/website commit before activation. For a later approved runtime rollback, disable the adapter and reload only Checkout after actual process exit; preserve its journal and all financial data. Never clear ambiguity or rewind the database. Genuine bank-confirmed live contribution acceptance remains unverified.

Draft-branch deployment safeguard: vercel.json disables automatic deployment only for integration/youpi-contributions-20261021, preserving the existing cron and all other branches. This follows https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled to honor the no-deployment review constraint. No Vercel deployment command was run.
