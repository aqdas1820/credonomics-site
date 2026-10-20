# CredoNomics website × YouPI-PG: guarded integration entry

## Scope of this branch
- Adds a standalone \`/pay\` preview page. There are **no payment calls or collection controls**.
- Deliberately does **not** modify the main navigation, market data, Upstox, or any existing checkout/payment state.
- No environment variables, paid services, hosted gateway, or secrets are required.
- The route is not indexed (\`robots: noindex\`).
- Do **not merge or enable payment collection** until the backend handoff and bank verification are accepted.

## Verified source structure
The existing website is a Next.js App Router application (\`app/\`) with a shared \`SiteFrame\`. The linked Vercel project deploys the GitHub \`main\` branch.

## Integration contract to implement before public launch
1. Authenticate the invoice owner or validate a short-lived, one-time signed invoice token **on the backend**; do not trust amounts or merchant identity from browser query parameters.
2. The trusted CredoNomics backend retrieves invoice id, currency, paise amount, merchant and receiving VPA from protected records.
3. Server-to-server adapter creates a YouPI payment session against the **actual approved/hosted** gateway, bound to merchant/order/amount/idempotency.
4. Backend returns only a safe, validated HTTPS checkout URL on an allowlisted origin. Redirect there for the existing WhatsApp OTP → UPI QR flow; avoid copying or reimplementing YouPI OTP client-side.
5. YouPI webhook ingestion authenticates raw-body signatures; prevents replay, cross-merchant/account attribution, terminal-state reversal, and duplicate credit reconciliation.
6. Never mark invoice PAID based on gateway SUCCESS, SMS, WhatsApp, a pasted UTR, a screenshot or synthetic evidence. Slice booked credit must be independently reviewed under an approved manual reconciliation policy, with durable audit trail. Automatic bank verification remains unavailable.
7. Customer receives an acknowledgement only after a clearly labeled, human-reviewed payment record; avoid claiming automated bank settlement or banking certification.
8. Audit any website-facing transaction status endpoints and implement throttling, authorization, retention, privacy disclosures and error states.

## Explicit blockers
- Current YouPI checkout / API run on a local Windows process; Vercel public serverless cannot call \`localhost\` on the user's PC.
- Public HTTPS payment host and backend-to-YouPI network reachability have not been established.
- Upstream payment-attribution, observer, status and misleading-security-claim issues need production review.
- CredoNomics website repo does not include the local Phase 11 BridgeKit or an invoice settlement backend.
- ₹0 operational-cost constraint must be reassessed with any hosting choice.

## Smoke checks before review
- \`npm run typecheck\`
- \`npm run build\`
- Verify \`/pay\` layout on narrow and wide viewports with no payment actions.
- Verify \`/markets\`, \`/ipo\`, \`/cards\` unchanged.
- Confirm no public checkout URL points to localhost.
