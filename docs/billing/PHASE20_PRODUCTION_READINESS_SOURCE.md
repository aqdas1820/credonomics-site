# Phase 20 — production-readiness source continuation

2026-10-18. Branch `feature/youpi-payment-entry-prelaunch`, existing Draft PR #1.
**NO GO: production readiness is not established. Additional spend: INR 0.**

Started from `d84d688a7b33ef24a8a6004fab324117c0395bba`; fetched and fast-forwarded
seven concurrent body-limit/CI commits through `fd6ab8a` before editing. They are
preserved. Two further concurrent commits through `f5d82d7` were merged while
finishing validation, preserving their shared UUID policy, cross-invoice RPC
guards and Phase 21 evidence. Overlapping admin/receipt changes were reconciled
with both the strict shared UUID guard and own-property admin claim checks;
the expanded full suite passed 272 tests after reconciliation. Historical
Phase 21 results describe that contributor's earlier commit, not this new source.
No main merge, deploy, migration, password reset, provider activation,
actual payment, customer message or database backup/restore was performed.

## Source implementation

- Added local server-side PDF rendering with pinned pdf-lib/fontkit/runtime,
  bundled licensed fonts, pagination and explicit missing-glyph rejection.
  Original invoice and PAID receipt use distinct validated authoritative snapshots
  and separate versioned archive keys. A gateway event cannot produce a receipt.
- Added persistent private-bucket adapter and atomic archive envelope containing
  exact PDF bytes, snapshot/digests and a separate-key HMAC. Create-only uploads,
  concurrent-create winner verification, post-write read-back and no regeneration
  of existing records protect application-level immutability. No update/delete API,
  public URL or untrusted PDF upload exists. GET retrieves only; same-origin POST
  creates or retrieves; both require freshly verified allowlisted admin identity.
- Added private UI download controls behind the **absent/default-off archive
  flag**. No actual bucket or key was provisioned. No feature was enabled. This
  source cannot certify provider WORM/retention or every issued invoice's archive
  coverage; those remain release blockers. See [archive architecture and limits](PDF_ARCHIVE_SECURITY.md).
- Hardened trusted admin claim ownership and UUID syntax; malformed/non-web Origin
  headers are denied. Added route-level auth, forged metadata, CSRF, scope, stream
  limit, cross-invoice mismatch and upstream error-containment cases.
- Hardened YouPI observation contract for invalid UTF-8 and exact issued-invoice
  order syntax. Unsupported payment events and authority-looking extra fields
  cannot settle invoices. Existing RPC contract binds invoice number/paise amount
  and persists replay conflicts; SQL files were not changed or executed. No
  upstream gateway implementation was copied, installed, deployed or exercised.
- Prepared four opt-in staging HTTP/session cases and a broader [E2E/release
  matrix plus external approvals](STAGING_E2E_RELEASE_RUNBOOK.md). Local built-server
  tests force all billing flags off and exercise anonymous HTTP/browser denials.
- Prepared [database-password rotation impact plan](DATABASE_PASSWORD_ROTATION_IMPACT_PLAN.md).
  It requires a separate exact-project execution approval and dependent-owner
  inventory; no reset, user/grant change or credential-store inspection occurred.

## Framework security work discovered during validation

Initial `npm audit --omit=dev --json` reported **one critical and two high affected
production packages**, including existing Next.js 14 Windows/Image Optimization
RCE advisories. These are registry advisories, not independently exploited findings.
Upgraded and pinned Next.js/eslint-config-next **15.5.28**, React/React DOM **19.3.1**
and React types **19.3.0**. Pinned PostCSS **8.5.30**, source-map-js **1.2.2**, and
compatible brace-expansion patches via overrides. No `npm audit fix --force` used.
All installations used locked/pinned npm packages with lifecycle hooks disabled.

Applied the [official Next.js 15 async request API changes](https://nextjs.org/docs/app/guides/upgrading/version-15)
to route/page parameters, search parameters and server cookies. Moved file tracing
to the supported config location and verified both fonts in the built route trace.
This required small compatibility edits beyond billing; no business data was
intentionally changed. Build-generated IPO/search data changes were discarded
because they were unrelated generator output, not user source edits.

Final production audit: **0 vulnerabilities**. Full audit: **5 high development-only
entries** across braces, micromatch, fast-glob, @next/eslint-plugin-next and
eslint-config-next, one unresolved glob-pattern stack-exhaustion advisory chain
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). The registry
still lists latest braces 3.0.3 as affected; no patched upgrade path was verified.
Do not feed untrusted glob patterns to tooling or call the full audit clean. Keep
this tooling issue open for upstream remediation/review; no advisory suppression
or unsafe forced downgrade was used. A clean audit is not a complete security audit.

## Actual commands and results

| Command/check | Actual result |
| --- | --- |
| `npm test` | PASS after concurrent-commit reconciliation: 37 files, 272 tests on upgraded React/Next stack; synthetic/mocked, no staging connection. |
| `npm run test:billing` (also prebuild) | PASS after reconciliation: 21 files, 200 tests. |
| `npm run build` | PASS on Next 15.5.28, 178 static pages plus dynamic routes, including archive endpoint. No deployment. |
| `npm run typecheck` | PASS after async parameter fixes/build-generated types. |
| `npm run lint` | PASS, exit 0; existing image/hook warnings outside changed billing code and Next lint deprecation remain. |
| `npx playwright test --config=playwright.billing-local.config.ts` | PASS: 3 local HTTP/browser cases against built loopback-only server with flags forced off; server stopped by runner. |
| `npx playwright test --config=playwright.billing-staging.config.ts --list` | PASS: 4 cases listed only; real staging execution NOT RUN. |
| `node scripts/check-billing-launch-readiness.mjs --self-test` | PASS: 5 checks. |
| `node scripts/check-billing-launch-readiness.mjs --assert-blocked` | PASS: NO GO, 2/13 documented gates verified, 11 blocked; manifest unchanged. |
| npm production / full audit | Production PASS (0); full audit FAIL/open (5 high dev-chain entries, 0 critical). |
| Font hashes / build trace | PASS: bundled font hashes recorded with OFL attribution; both TTFs present in archive route trace. |
| React review | Checked server-only PDF/key boundaries, limited client props, event-driven download, disabled busy state, accessible status, no unsafe HTML; TypeScript/lint pass. |
| Report/source checks | `git diff --check`, allowed-file review and credential/private-artifact marker checks before commit. |

Failures encountered and resolved: initial Devanagari PDF test exposed fontkit's
missing regenerator runtime; added pinned runtime. Large PDF test exposed repeated
shaping cost; cached width measurements and retained a bounded long-document test.
First local HTTP test expected handler 503 but middleware correctly returned 404;
expectation corrected after source inspection. First Next 15 build/typecheck exposed
remaining synchronous query props; converted them and the subsequent build passed.
No failed or merely listed test is described as passing staging recovery.

## Remaining release blockers and shortest safe path

1. Existing database credential unavailable: retain blocked backup/restore, or
   separately approve the reviewed rotation plan. Then complete private read-only
   backup and disposable local restoration for exact project
   `jvpiulmcjjnsgozgqgzw`. Encryption synthetic recovery is already verified; it was
   not repeated and is not a database/PDF-storage recovery certificate.
2. Privately approve issuer/tax/privacy/retention particulars; verify existing free
   archive capacity, actual private bucket/access policies, independent key custody,
   byte-preserving retention/restore and invoice/archive coverage. Source tests
   use mocked storage; actual persistent Supabase archival is **NOT RUN**.
3. Only after recovery/rollback review, seek separate exact-ref staging migration
   approval. Then perform hosted JWT/Auth/RLS, races and prepared synthetic E2E.
   Do not apply SQL 012–016 under this task.
4. Obtain written YouPI rights for the reviewed version, security close-out,
   approved merchant/beneficiary and authoritative bank reconciliation. Public
   repository access is not a license. Real WhatsApp OTP needs official provider,
   business/number/template approvals, consent and independently verified recurring
   INR 0 terms; free service replies are not unrestricted free authentication OTP.
   No unofficial channel, paid tier or alternate medium was silently substituted.
5. Resolve the open development-tool advisory chain, complete actual archive/OTP/
   gateway/bank E2E with approved entitlements, then obtain final owner release
   approval. Main merge/deploy and live payment activation remain separate actions.

No secrets, customer records, session files, real PDF/archive exports or private
backup artifacts belong in this PR. Only public fonts, source, synthetic tests,
configuration and sanitized evidence are committed. Final commit SHA is supplied
in the session result; remote CI is distinct from local results and must be checked
at the published commit before any future release decision.
