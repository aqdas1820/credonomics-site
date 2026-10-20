# Phase 26 — production integration and private owner testing

Date: 2026-10-19. **GO for local personal testing and integration review;
NO-GO for enabling the owner TEST workspace on production until genuine Auth,
owner authorization and key custody are verified.** No PR was merged and no
deployment was performed. Additional expenditure: INR 0.

## Integration and production preservation

[Draft PR #7](https://github.com/aqdas1820/credonomics-site/pull/7) targets `main`
from `codex/phase26-production-integration`. The branch was created from fetched
production `7c6592241953d5b08e1e1f49069b01722b71fe43`, then merged the tested
Phase 25 head `4caac9d4f00a4e04a645ddf3bd53171026c8adb8`, which contains Phases
23/24. Merge commit: `03b218ee2e3b1763438a4ce54e2aa795132ab7d3`.

The common ancestor is `b492f55631d383465b9bdfa886287643d0460094`. Production
changed exactly eight catalog/intelligence files after it: the generated and
public copies of card auto-catalog, card review queue, IPO discovery and IPO
market master. **All eight retain the exact production Git blobs.**
`PHASE26_PRODUCTION_BASELINE.json` records those blob IDs and
`node scripts/check-phase26-production-baseline.mjs` checks the working files
before and after CI build, including Git's line-ending normalization.

There were no source merge conflicts and no production data was replaced with
the older feature-branch versions. The first merge attempt encountered an
auto-generated `next-env.d.ts` update after the branch switch; that generated
change was restored before merging. No user-authored work was discarded.

The integration intentionally includes the previously tested Phase 23 framework
compatibility/security work: production Next 14.2.35/React 18.3.1 moves to locked
Next 15.5.28/React 19.3.1, with awaited dynamic route params, search params and
cookies. This is a material integration change; public route/browser coverage
therefore accompanies the financial tests. The latest catalog/IPO refresh
workflows and website features are retained. Generated search/IPO dashboard
outputs from local verification are not used to overwrite production sources.

Automatic Vercel deployment is explicitly disabled for this integration branch
in `vercel.json`. Existing deployment settings and cron configuration remain.
No hosted SQL, database mutation, credential change, Railway operation, paid
resource, checkout or settlement operation was performed.

## Working owner workspace and TEST PDF improvements

The operational Phase 25 feature remains: editable multiline INR drafts,
integer-paise totals, 50-record encrypted browser history, up to 20 items, TEST
issuance, pending/failure/retry/success/refund simulation, PDF download and A4
print. `kind: TEST` and `realSettlement: NONE` remain mandatory. The new routes
have no real settlement or receipt adapter. Simulated SUCCESS cannot create a
real PAID receipt.

The PDF now embeds the existing local CredoNomics mark, uses a navy/teal/gold
identity, a customer/date/status panel, alternating item rows, separate quantity,
rate and amount columns, right-aligned Indian-grouped INR totals and a prominent
TEST total block. Descriptions wrap without losing text. Continued pages repeat
branding, table headers, TEST warnings, watermark and page numbering. Every page
states no bank credit, payment due or paid receipt. No payment QR, active checkout
link, remote font or remote image is embedded. Server output tracing includes
the local mark and fonts.

Synthetic standard and five-page boundary PDFs were independently extracted with
pypdf 6.16.1. All 20 long items, a 120-character wide customer, quantity 2147483647
and INR 10,00,00,000.00 total survive. Alignment, A4 dimensions, per-page warnings,
embedded brand and absence of active annotations are checked. Actual generated
PDFs were rasterized locally with PyMuPDF 2.0 and visually inspected, including a
continued item page and final large total. Raster tooling/fixtures stay in ignored
`artifacts/`; no financial records, screenshots or PDFs are uploaded by CI.

## Authorization audit and strengthened controls

Hosted readiness requires the explicit `hosted` runtime, feature flag, valid
server encryption key, one valid owner UUID, exact approved Supabase project ref
matching the HTTPS project URL, and a nonblank publishable key. Missing or
inconsistent configuration returns an early private HTTP 404.

For configured hosted requests, middleware calls real `auth.getUser()` and checks
both the exact owner UUID and trusted boolean `app_metadata.billing_admin ===
true` before page streaming. Another admin or user-editable `user_metadata`
cannot grant access. Auth errors fail closed. Refreshed cookies are preserved on
the same response with private/no-store and noindex headers. The page and every
data/PDF request independently verify the owner again. Configuration and mocks
are never substitutes for genuine server verification.

Hosted mutations pin Origin and Host to `https://www.credonomics.in`; internal
Next server URL normalization cannot change that decision. Local mutations retain
exact loopback Host/port + Origin checks. The local unlock fallback is development
only, refuses Vercel/Railway environments and cannot authorize production. Private
routes remain excluded from public search generation and the public sitemap does
not advertise them.

The audit also fixed the existing OAuth callback's external `next` redirect:
return paths must stay on this site, and missing code/configuration, rejected
exchange or exceptions return to `/account` with a failure/unavailable marker.
Callback responses are private/no-store with no-referrer. Code exchange is still
performed by the existing Supabase SSR client; no provider or credentials changed.

History encryption remains AES-256-GCM with random nonces, owner-bound AAD and
server-only key handling. Windows local keys remain current-user DPAPI protected.
The practice history is a mutable encrypted browser snapshot, not an accounting
archive or durable backup; replay, browser clearing and key loss remain explicit
limitations. Sign-out removes server access but cannot erase already downloaded
documents or browser memory. Use fictitious test customer data only.

## Actual production prerequisites: verified versus unknown

An anonymous read-only request to
`https://www.credonomics.in/api/account/session` during Phase 26 returned HTTP 200,
`configured: false`, `hasUser: false`. That proves the deployed application does
not have a complete recognized Auth URL/publishable-key pair. It does not reveal
whether a project/provider exists or which individual variable is missing.

| Gate | Current evidence |
| --- | --- |
| Production code integration | Implemented; latest eight production intelligence blobs preserved |
| Local workspace, TEST PDF, ciphertext/auth denial logic | Verified with synthetic fixtures and local server/browser tests |
| Real production Auth | BLOCKED: deployed account endpoint reports unconfigured |
| Owner UUID and trusted `app_metadata` | UNKNOWN: no real private user/claims inspected or changed |
| Production TEST key provisioning/custody | UNKNOWN: no secrets inspected, generated for hosting, or changed |
| Genuine owner/non-owner sessions on real domain | NOT RUN; needs approved Auth configuration and controlled deployment |
| Financial release | NO_GO; existing manifest and financial flags remain closed |

Required owner-approved configuration, never secret values in GitHub or chat:

| Setting | Exact requirement |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing approved production Auth project's HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Matching publishable key; never a service-role key |
| `PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF` | That exact 20-character approved project ref; do not infer it from a staging billing fixture |
| `PERSONAL_TESTING_RUNTIME` | `hosted` |
| `PERSONAL_TESTING_OWNER_ID` | One actual owner Auth UUID, independently verified privately; no comma-separated list/email/user-supplied identity |
| Owner metadata | Trusted admin provisions boolean `app_metadata.billing_admin=true`, preserving other metadata, only with separate authorization |
| `PERSONAL_TESTING_ENCRYPTION_KEY` | Dedicated cryptographically random stable 32-byte key encoded as 64 lowercase hex characters, server-only secret; never `NEXT_PUBLIC_*` or a banking/Upstox key |
| `PERSONAL_TESTING_ENABLED` | Keep `false` until the approved controlled owner-only acceptance deployment |
| Real billing | Explicitly retain `false` for `BILLING_PORTAL_ENABLED`, `BILLING_API_ENABLED`, `BILLING_WRITE_ENABLED`, `BILLING_SETTLEMENT_ENABLED`, `BILLING_SYSTEM_ENABLED`, `BILLING_YOUPI_OBSERVATION_ENABLED`, `BILLING_PDF_ARCHIVE_ENABLED` |

The existing `/account` flow uses Google OAuth. An authorized operator must verify
the existing provider setup, approved site URL and exact callback
`https://www.credonomics.in/auth/callback` against the actual project/provider.
No provider setup or account creation was performed. No service-role key is
needed in the deployed personal workspace. Trusted metadata administration, if
needed, belongs to an independently authorized private admin session, not the
public application or this CI.

`NEXT_PUBLIC_*` configuration must exist at **build time** as well as in the
deployment environment; setting it only after building does not repair an
already-built client. Confirm the approved production deployment scope and
canonical host before building. Keep keys out of logs and use the owner's
existing protected secret storage. Losing/rotating the TEST encryption key makes
existing browser history unreadable; a local DPAPI key is not automatically the
production key and local history is not transferred by deployment.

## Shortest safe path and authorized acceptance plan

1. Review Draft PR #7 and its exact green commit. Independently confirm `main`
   has not advanced; if it has, update/retest the integration and baseline rather
   than overwriting the refreshes. No automatic merge/deploy is authorized.
2. Owner separately authorizes the existing Auth/provider configuration, exact
   owner/metadata and TEST key custody. Inspect only required configuration in a
   private operator session. No SQL migrations, financial table writes, new paid
   resource or banking configuration is needed for this workspace.
3. An explicitly authorized deployment can first keep personal testing disabled
   while confirming genuine `/account` login and server identity. Enabling the
   owner-only canary on the canonical domain requires separate approval and all
   readiness fields; it is not inferred from synthetic CI. A preview URL cannot
   stand in for the canonical-domain mutation acceptance.
4. With explicit controlled-deployment authorization, run the following matrix
   using separate private browser profiles. All customer/item data is fictitious.
   Keep evidence private and redact identifiers; do not export HAR files, cookies,
   tokens, storageState or keys into the repository/CI/chat.

| Actor/check | Required acceptance |
| --- | --- |
| Anonymous, including forged local cookie | Workspace/data/PDF/local-unlock routes denied; no records or admin controls; private/no-store |
| Genuine ordinary Auth user | Same denials, even after copying a TEST record ID; backend denies before blob parsing |
| A different trusted admin, if authorized and available | Denied despite `billing_admin=true`; exact owner UUID still required |
| Genuine verified owner | Workspace and data/PDF work; two lines total INR 2,719.00, save/edit, reload encrypted history, issue/pending/failure/retry/success/refund |
| Owner simulated success | TEST-only PDF, no bank credit, PAID receipt, real invoice or settlement; real billing endpoints remain disabled |
| Cross-origin/foreign Host | Mutations denied even with valid owner context; no CORS workaround |
| Logout / expired session / revoked admin claim | Subsequent page/data/PDF denied; refresh cookies remain private; revocation tests require explicit Auth-administration authorization |
| Tamper or wrong browser-owner context | Ciphertext rejected; no plaintext/cross-user history recovered |
| Responsive and download | 320/375/768/1440 real-domain layouts and TEST PDF print/download checked; edge caching never shares private responses |

For a status-only same-origin API probe inside each actor's own browser console:

```javascript
fetch('/api/personal-testing', {
  method: 'POST', credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ command: { action: 'read' } })
}).then(response => console.log(response.status))
```

Expect HTTP 200 only for the verified owner, denial otherwise. Never paste session
cookies or tokens into the probe. Browser code cannot safely simulate a genuine
second user's authorization; that user needs their own approved real session.
An Auth outage must fail closed. If acceptance fails, an authorized operator sets
`PERSONAL_TESTING_ENABLED=false` and performs the hosting platform's required
redeployment/rollback; environment edits alone may not affect an existing build.
Do not weaken owner checks to obtain a green result.

## Reproduction and verification evidence

For the owner, from this integration checkout on Windows:

```powershell
Set-Location 'D:\CredoNomicsProject\youpi-lab\CredoNomics-Payment-Pilot-v4\phase17-credonomics-site'
git switch codex/phase26-production-integration
npm ci --ignore-scripts --no-audit --no-fund
npm run billing:personal
```

Open **http://127.0.0.1:3018/personal-testing** and enter the fresh session code
shown only in the private local terminal. The normal Windows launcher uses DPAPI;
no hosted credentials or Auth are needed. Keep this development server bound to
loopback and do not tunnel/share it. See the Phase 25 report for session/key limits.

Verification commands (local synthetic fixtures only):

```powershell
node scripts/check-phase26-production-baseline.mjs
$env:PERSONAL_PDF_FIXTURES='1'
$env:BILLING_DOCUMENT_FIXTURES='1'
npm test -- --maxWorkers=2
Remove-Item Env:PERSONAL_PDF_FIXTURES
Remove-Item Env:BILLING_DOCUMENT_FIXTURES
python scripts/check-personal-test-pdfs.py # prerequisite: pypdf 6.16.1
npm run build
npm run typecheck
npm run lint
node scripts/test-personal-production-denial.mjs
npx playwright install chromium
npx playwright test --config=playwright.phase26-public.config.ts
npx playwright test --config=playwright.billing-local.config.ts
npm run test:personal
node scripts/check-billing-launch-readiness.mjs --assert-blocked
```

Use the built-server/public/billing checks before the owner dev browser suite
changes `.next`. CI installs dependencies on free standard runners for this public
repository. CI has no hosted secrets, private dumps, real token contents or
artifact upload. The public-browser suite blocks third-party browser traffic and
checks served production JSON against its preserved source. Tests requiring a
live market feed, provider credentials or real production Auth remain external
acceptance, not a fabricated local pass.

Implementation source: `36ed0a9a376acf706010d83dbd37cf118c7628d0`.
[CI run 39235533850](https://github.com/aqdas1820/credonomics-site/actions/runs/39235533850)
passed all three jobs:

| Job | Verified result |
| --- | --- |
| Integration, job 118003722535 | 45 unit files / 310 tests; independent standard and five-page PDF checks; 20 PostgreSQL safety tests; 2 remote inventory, 4 Worker and 17 encrypted-token-store tests; exact production baseline before/after build; build, types, lint; built-production Auth/forged-cookie denial; 45 public responsive, 7 billing denial/layout and 5 owner workflow browser tests; unchanged release NO_GO assertion |
| Recovery, job 118003722363 | 18 deterministic guard tests; official isolated Supabase PG17 + GoTrue synthetic recovery PASS, 10 RLS assertions, catalog MATCH, auth baseline UNCHANGED, missing-role rollback/missing-Auth/data-before-schema failures correctly rejected |
| Windows backup, job 118003722921 | 13 synthetic backup safety tests and real native SFTP fixture test passed, without Railway access or private keys |

CI's synthetic PR merge commit was
`e1dc7f8384b8672ab4acc4eda6b0d0bcea27cf35`; independent `git diff --quiet`
against implementation source returned exit 0. Both production main and the
tested Phase 25 head are confirmed ancestors of the integration. The earlier
run at `d396b60dc3b9f87d91ca5c9bc737805f4b34b4c1` was cancelled by the subsequent
OAuth hardening commit, not reported as a passing final run.

Local Windows: 307 unit/API regressions plus all 3 focused OAuth callback tests
passed; final build, TypeScript, lint, built-server production denial, all 45
public responsive, all 7 billing denial/layout and all 5 owner workflow browser
tests passed. Independent
PDF, 18 recovery guard, 13 backup/native SFTP and 2/4/17 inventory/Worker/token
prototype tests passed locally. Genuine container recovery and PostgreSQL tests
ran in CI; no local runtime was installed and no hosted database was contacted.
Existing site CSS/autoprefixer, image/hook lint and framework deprecation warnings
remain; they did not fail build or lint. There are no unresolved assertion
failures in the recorded final CI run.

This report is a subsequent documentation-only commit; its PR check run is linked
in the PR description after completion. No application changes followed the
passing implementation source. Remote `main` remained
`7c6592241953d5b08e1e1f49069b01722b71fe43` at the final preservation check.

## Remaining release decision

Enabling real-domain personal testing is **NO-GO** while production Auth reports
unconfigured and owner/key prerequisites lack genuine evidence. A disabled code
integration may be reviewed separately after passing CI and explicit production
flag review. No deployment approval is assumed or executed.

Full financial release remains **NO_GO**: actual encrypted DB recovery, genuine
hosted Auth/RLS isolation, immutable PDF archive recovery, lawful issuer/privacy
details, independent booked bank-credit/receipt evidence, WhatsApp server OTP,
YouPI licensing/security, beneficiary/order binding and zero-cost streaming/
hosting acceptance remain unresolved. The synthetic Supabase recovery exercise
does not restore the owner's actual encrypted backup or authorize hosted changes.

Auth review references: [Supabase server-side client/cookie guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[JWT verification](https://supabase.com/docs/guides/auth/jwts), and
[current changelog](https://supabase.com/changelog). The markdown changelog fetch
was unsupported; HTML was reviewed. No new Auth SDK, schema or provider was
introduced. Next 15 retains `middleware.ts`; this is not a Next 16 migration.
