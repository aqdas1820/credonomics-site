# Phase32 validation evidence

Local source based on Phase31 afbee1011b7cc9e8dcefac9d060f398d0489d083.
No hosted migration, Auth user/privilege creation, DNS, production deployment,
activation flag or payment was executed. Real payment pilot: BLOCKED.

Locally executed:
- 382/382 unit tests, including real financial document rendering/archive/recovery,
  denied admin routes and explicit missing/savings account-type rejection.
- 24 recovery safety/manifest guards pass; one native Windows synthetic test is
  intentionally skipped on Linux and runs only on the Windows CI runner.
- TypeScript noEmit passes.
- Full Next production build and pinned OpenNext build pass (179 static pages).
  Existing unrelated lint/CSS warnings remain; no new compile errors.
- Wrangler dry-run passes: 16,502.04 KiB raw / 3,925.18 KiB gzip, 595 static assets.
  No upload/deployment/account token used. This is not Free-plan admission proof.
- Real local workerd imports application HMAC/tamper rejection, QR HTML generation,
  Supabase SSR anonymous denial, Hindi invoice PDF and branded TEST PDF: pass.
- Full bundled deployment artifact in local workerd: disabled manual checkout,
  billing portal and admin API return 404/no-store; account/session200/configured:false.
- Disabled release gates remain asserted BLOCKED.
- All eight SQL hashes and atomic bundle hash match the retained Phase31 values.

The full-app local test uses Wrangler's dry-run artifact rather than unbundled
OpenNext source because unstable_dev's module collector mishandles upstream OG
absolute WASM asset paths. It exercises the actual deployable bundled Worker.

GitHub Phase32 CI additionally executes the native PG17 38-test financial suite,
atomic eight-script failure/refusal drill, synthetic database export/restore,
Windows PG17 native full-database roundtrip and PowerShell parser, and four
Chromium desktop/mobile QR/disabled-endpoint tests. Exact terminal CI results are
recorded in PR13 after completion. Synthetic fixtures never establish actual hosted
Auth, backup recovery or bank-credit verification. Earlier cancelled/failed runs
must not be cited as passing evidence.

Not verified: actual owner encrypted export and restoration; compatible Vault
extension/key recovery; production database designation; hosted Google login,
refresh/logout and real non-admin denial; approved admin UUID; production hosting
plan/commercial entitlement and Workers Free CPU budget; real beneficiary VPA,
UPI resolved payee, business-current-account authorization; booked bank credit,
UTR, first genuine PAID receipt. These remain acceptance gates.
