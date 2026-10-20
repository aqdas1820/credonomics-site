# Phase32 hosting compatibility evaluation

No cloud resources, subscriptions, builds, routes, DNS or deployments were created.
Existing Cloudflare account `d20a343ec7229d56b5c79b20aab6be4a` is accessible;
Workers inventory is empty and account settings default_usage_model is standard.
That setting does **not** establish Free vs Paid entitlement. Subscription inspection
returns 403 because connected OAuth lacks Billing Read. Vercel get_team also omits
plan information. Production commercial eligibility is therefore unverified.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) and
[fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines) restrict Hobby to
non-commercial personal use. Do not collect business payments on Hobby. An owner
may establish an already-paid eligible team; no upgrade or card was authorized.

[Cloudflare Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
does not state a general non-commercial-only restriction for Free Services, but
prohibits collecting/processing credit-card information on Free properties (2.2.1h).
This UPI flow collects no card details. Eligibility is an interpretation of the
published terms for this implementation, not account/provider approval or legal advice.
Free service can be terminated at provider discretion; no uptime/cost guarantee.

[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) lists
Free 100,000 requests/day, no duration charge and 10ms CPU/invocation. Paid starts at
$5/month plus potential usage; not authorized. Current official
[limits](https://developers.cloudflare.com/workers/platform/limits/) list 128MB memory,
50 subrequests, six simultaneous outbound connections, 64 variables, 64MiB Worker
size, one-second startup, 20,000 assets and 25MiB/file on Free. Older OpenNext docs
still mention a 3MiB compressed Free limit; do not use stale text to certify account
eligibility. Verify actual upload/account limits and hosted CPU before approval.
A local dry-run proves bundling, not admission or 10ms CPU compliance.

The entire existing Next15.5.28 app is evaluated with pinned OpenNext1.20.12 and
Wrangler4.151.3. No framework rewrite or new payment adapter. Social image routes use
Node rather than unsupported OpenNext edge route placement. Licensed Noto fonts and
TEST-document logo are inline bundled bytes instead of runtime filesystem reads;
financial document content, immutable snapshot and receipt eligibility are unchanged.
Next build and Vitest both use real original font bytes. Runtime QR, HMAC and PDF
probe imports actual application functions; the server-only marker alone is omitted
from the standalone probe, while production Next retains it. No fake Auth server or
financial database is substituted and called a hosted pass.

```
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run cf:build
npm run cf:dry-run
node scripts/cloudflare/verify-local.mjs
```

Run from clean source using Node22 and no cloud credentials. These commands create
only local outputs. `wrangler.jsonc` has no routes, workers.dev, preview URLs, remote
bindings, paid storage, cron, queues or deployment command. All payment/settlement/
portal flags are false. OpenNext default dummy cache requires no R2/KV/DO provisioning;
ISR/incremental revalidation across instances is not certified. Existing financial
routes are no-store and PostgreSQL remains their durable authority. Preserve unrelated
site revalidation requirements in a separate deployment acceptance review.

`verify-local.mjs` starts a synthetic workerd probe, tests actual cryptography/tamper
rejection, QR generation, SSR anonymous denial, Hindi invoice PDF and branded TEST PDF,
then tests disabled routes and anonymous account/session in the full OpenNext Worker.
No live tokens, service-role key, upstream gateway or bank credentials are loaded.
Browser acceptance separately covers 375px and 1280px private QR rendering/decoding.
No local timing measurement is represented as Cloudflare production CPU proof.

Before any production use: owner confirms existing Workers Free entitlement and no
paid subscription/metered add-ons; approves an isolated non-billable deployment and
its exact origin; validate hosted CPU/startup/memory for SSR, QR and both PDF paths,
Auth cookies/Google callback, no-cache behavior, env count and outbound Supabase TLS.
If PDF or SSR exceeds Free CPU, remain BLOCKED; do not silently upgrade or weaken
financial/auth controls. QR/receipt generation may need an approved architecture
change after measured evidence. No unexpected-charge risk is claimed eliminated.

The AWS gateway cutoff remains 27 Oct2026 01:38:48IST per Phase31 audit. The independent
manual path has no EC2/YouPI runtime dependency, but currently lacks an approved
production hosting deployment. Railway subscription/usage cost is not proven zero;
no extra service, volume or deployment was created there.
