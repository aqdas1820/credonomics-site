# Phase 25 — owner personal TEST workspace

Date: 2026-10-19. Decision: **local personal testing operational; enabling production personal testing remains blocked by production Auth configuration. Real financial launch remains NO_GO.**

Draft [PR #6](https://github.com/aqdas1820/credonomics-site/pull/6) stacks
`codex/phase25-personal-testing` on `codex/phase24-offline-db-recovery` (PR #5).
It preserves the Phase 23/24 implementation. No merge, deployment, hosted migration,
Railway change, hosted credential change or real payment activation was performed.
No additional spending or paid resource was used.

## Operational features

`/personal-testing` provides editable TEST drafts, up to 20 line items, integer-paise
INR totals, a 50-record history, draft editing, issuance, pending/failure/retry/
success/refund simulation, real downloadable A4 PDFs and an A4 print layout.
PDFs embed the existing Noto fonts and mark every page TEST. Both PDF and printed
documents explicitly deny payment, bank-credit and paid-receipt status.

All records have `kind: TEST` and `realSettlement: NONE`. The model has no PAID
status or real receipt transition. The new API does not invoke the real invoice,
settlement, archive, YouPI, OTP or banking adapters. Simulated SUCCESS cannot create
a real PAID receipt. Existing financial feature flags and release gates were not
relaxed. The launcher explicitly disables real billing flags.

History is an AES-256-GCM encrypted browser-local snapshot, authenticated to the
owner identity. Only the authorized server decrypts it; the browser receives
plaintext for display after authorization. Keys stay server-side. Tampered or
cross-owner ciphertext is rejected. Web Locks serialize same-browser tab updates.
This is a practice ledger, **not an immutable accounting archive**: snapshots can
be replayed, browser clearing loses history, and there is no cross-device sync or
claim of durable backup. Use fictitious customers only. No database writes or
schema migrations are needed for this feature.

## Exact Windows operator procedure

Prerequisites: the Phase 25 checkout, Node.js 22/npm, Windows PowerShell 5.1 with
current-user DPAPI, a private Windows login, and current Chrome/Edge (Web Locks,
local storage and downloads enabled). Port 3018 must be free. Initial dependency
installation needs internet; subsequent use requires no hosted backend.

```powershell
Set-Location 'D:\CredoNomicsProject\youpi-lab\CredoNomics-Payment-Pilot-v4\phase17-credonomics-site'
git switch codex/phase25-personal-testing
npm ci --ignore-scripts --no-audit --no-fund
npm run billing:personal
```

Open **http://127.0.0.1:3018/personal-testing**. Enter the fresh local session code
shown in that private terminal. Do not place it in a URL, chat, screenshot, GitHub
or CI log. Do not use `--fixture`, which is exclusively a synthetic test harness.
Keep the terminal running; first compilation can take time. No Supabase, Railway,
YouPI or WhatsApp credentials are required. Do not run the key helper directly:
the launcher captures its key output privately in memory.

1. Create a draft with two fictitious line items, save it, reload, select it in
   history and edit it before issuance.
2. Issue the TEST document; simulate pending, failure, retry, success and refund.
   Confirm success still states no bank credit and no paid receipt.
3. Download the TEST PDF and inspect its TEST marking; use Print for A4 output.
4. Click **Lock local session**. The record interface disappears and data API
   calls are rejected. Ctrl+C stops the server. Restart requires the new code;
   history remains readable under the same Windows account and browser origin.

The launcher binds **only 127.0.0.1**, checks exact Host/Origin, and issues an
HttpOnly SameSite=Strict signed session lasting at most eight hours. Unlock has
bounded input and a ten-failed-attempt/minute limit. Restart rotates the unlock
code/session signing key. The local encryption key persists under
`%LOCALAPPDATA%\CredoNomics\personal-testing\ledger-key.dpapi`, protected by
Windows current-user DPAPI; newly created directory ACLs grant only that user and
SYSTEM. Reparse paths and wrong directory ownership are refused. Actual Windows
key creation and reopening were tested without displaying the key.

Do not forward/tunnel this development server, bind it to a LAN address, share its
terminal or use a shared browser/OS login. Local session cookies use HTTP only on
loopback. The fallback is rejected in NODE_ENV=production, Vercel and Railway
environments. This mode trusts the local Windows user and machine; it is not
protection against an administrator or malicious local software.

Non-Windows use requires a privately supplied stable 32-byte lowercase hex TEST
key in `PERSONAL_TESTING_ENCRYPTION_KEY`; the launcher intentionally writes no
plaintext key file. Windows is the verified owner procedure.

## Production access: exact blocker and required configuration

An anonymous read-only probe of
`https://www.credonomics.in/api/account/session` returned HTTP 200 with
`configured: false` and no user on 2026-10-19. The deployed application therefore
does not currently have a complete Supabase Auth URL/publishable-key pair. No
private configuration was inspected and no credentials were changed.

Production personal testing defaults off. Missing configuration yields 404 for
the workspace/data/session routes; unauthorized users cannot obtain records or
admin controls. Every hosted request calls the existing server-side
`auth.getUser()` wrapper. Access requires **both** the exact single owner UUID
and trusted boolean `app_metadata.billing_admin: true`. Another billing admin,
user-controlled metadata, anonymous sessions and Auth outages fail closed.
Local unlock cookies cannot authorize production.

Any later owner-authorized production configuration requires:

| Configuration | Requirement |
| --- | --- |
| Existing Supabase Auth | Approved `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; configured account login/callback |
| `PERSONAL_TESTING_ENABLED` | `true` only after owner access acceptance |
| `PERSONAL_TESTING_RUNTIME` | `hosted`, never `loopback` |
| `PERSONAL_TESTING_OWNER_ID` | Exact verified owner Auth UUID |
| `PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF` | Exact approved Auth project ref matching URL |
| `PERSONAL_TESTING_ENCRYPTION_KEY` | Dedicated stable 64-character lowercase hex server secret; never `NEXT_PUBLIC_*` |
| Owner Auth metadata | Trusted administrator provisions boolean `app_metadata.billing_admin=true`; user metadata cannot grant access |
| Existing real billing flags | Keep checkout, issuance, settlement and archive flags disabled |

No service-role key is required by this workspace. No new Auth provider or hosted
database setup was performed. Do not reuse Upstox/banking keys. Key custody and
rotation need an explicit plan: losing/rotating this TEST key makes existing
browser history unreadable. Hosted sign-out is through the existing `/account`
flow; no new hosted local-code login is offered.

Before enabling production, demonstrate with genuine configured Auth sessions:
anonymous and ordinary user denied, second admin denied, exact owner admitted,
metadata revocation/logout deny subsequent API calls, cross-origin mutation
denied, and TEST PDF/history work only for the owner. Also verify denied HTML/API
responses remain private/no-store at the deployed edge. Unit mocks and the
synthetic browser harness do **not** establish real Supabase session isolation.

## Verification and evidence

Local Windows verification:

| Check | Result |
| --- | --- |
| `npm test -- --maxWorkers=2` | 42 files / 302 tests passed |
| `npm run test:personal` | 5 passed, including widths 320/375/768/1280 |
| Actual UI → API → encrypted history reload | Passed, two lines total ₹2,719, edit before issue and complete simulation |
| Authorization denials | Anonymous API, wrong unlock, hostile Origin, lock/revoked local session denied; real billing page/API disabled |
| PDF/print/responsive | PDF download and TEST metadata passed; A4 print hides controls; no horizontal overflow or page errors; mobile and desktop screenshots generated locally from synthetic data only |
| Owner/config/crypto regression | Exact owner + trusted metadata, server verification, Auth failure, production fallback rejection, expiry, tamper/cross-owner rejection and invalid transitions covered |
| Windows protected key | Creation/reopen passed, no secret output retained |
| Final local production build, TypeScript, lint | Passed at `f00ec5eec37bb225059eedd63e7eaed2dff3cddd`; existing warnings remain |
| Built production server without Auth | Passed: page/data/local-session API HTTP 404, forged cookie rejected; generated search excludes owner workspace |

Reproduction commands after dependency installation:

```powershell
npm test -- --maxWorkers=2
npm run build
npm run typecheck
npm run lint
node scripts/test-personal-production-denial.mjs
npx playwright install chromium
npm run test:personal
node scripts/check-billing-launch-readiness.mjs --assert-blocked
```

Run the built-server check **before** the dev browser suite changes `.next`.
The built-server check uses synthetic configuration, enables the TEST flag but
omits Auth, and verifies page/data/local-session routes return 404 even with a
forged local cookie. The browser fixture binds 127.0.0.1:3019, uses explicitly
synthetic keys/code, and never reads the owner's Windows key or financial records.
Screenshots are ignored local artifacts; the workflow uploads no record artifacts.

Successful CI at source `4cde3ea60b7ea894cdc335154b5ca145921bc3cb`:
[run 39225241394](https://github.com/aqdas1820/credonomics-site/actions/runs/39225241394),
job 117969806179. All 302 tests, existing disposable PostgreSQL financial SQL
regressions, production build, TypeScript, lint, all 5 browser tests and the
assert-blocked launch check passed. PostgreSQL regression Auth helpers are
existing synthetic test helpers, **not** real Supabase Auth/RLS E2E evidence.
The Phase 24 genuine Supabase restore boundary and actual encrypted-backup restore
blockers remain as documented in its report.

Final implementation source `f00ec5eec37bb225059eedd63e7eaed2dff3cddd` adds the
built-production denial test, excludes owner routes from public search generation,
and denies missing hosted Auth in middleware before streaming starts.
[Final CI run 39226441706](https://github.com/aqdas1820/credonomics-site/actions/runs/39226441706),
job 117974135942, **SUCCESS**: 302 tests, 20 PostgreSQL regression tests, build,
TypeScript, lint, built-production denial/search check, all 5 browser workflows,
and the unchanged blocked-release assertion. CI tested PR merge tree
`1580ef251cb9d7288e3e9bac525f97efc5b777f5`; its tree was independently compared
with source `f00ec5eec37bb225059eedd63e7eaed2dff3cddd` using `git diff --quiet`
(exit 0). This report is a subsequent documentation-only commit. Local final
build/types/lint and built-server denial also passed. Incidental IPO/search
generated-file changes from verification were restored; the generator fix is
committed and runs during every build.

Failures found and resolved: the first browser startup exceeded its cold-compile
timeout; the timeout was increased. Real browser mutations then exposed Next's
internal localhost URL normalization; validation now uses the exact trusted
loopback Host/port plus matching Origin. The corrected suite passed twice. One
full local unit run overlapped dev compilation and hit three existing 5-second
test timeouts (299 passed); the isolated bounded-worker rerun passed all 302.
Initial CI at `632d546c5c15dd7735e47d2a86db31b775cde603` failed browser coverage
before the origin fix; the successful later run supersedes it. Existing site CSS
autoprefixer/deprecation warnings remain outside this change.

The new production-build check then failed at `206b9147ae930a47dec34ed13a41e8df5ff109ef`:
Next streamed the missing-Auth not-found document with HTTP 200. The workspace was
absent, but this failed the explicit status-code acceptance. Early middleware
denial fixes that behavior; the test was retained. Build review also found the
automatic search generator advertising the private route title; it now excludes
the owner route and descendants, with a generated-index regression assertion.

## Approval decision and remaining release blockers

The owner can use the localhost build now. **Do not approve enabling this feature
on production yet:** genuine production Auth is unconfigured, owner configuration
and secure TEST key custody are pending, and real owner/non-owner hosted-session
acceptance has not run. A code-only deployment with the feature disabled can be
reviewed separately; no deployment was requested or performed here.

Real finance remains disabled: actual complete DB recovery, real Auth/RLS isolation,
PDF archive retention/create-only recovery, independently verified bank-credit
evidence and paid-receipt issuance, server-verified WhatsApp OTP, YouPI licensing
and upstream security, lawful issuer/privacy configuration, beneficiary/order
binding, and zero-cost hosting/Upstox streaming gates remain unresolved. Personal
simulation does not satisfy any of those gates or alter the release manifest.
