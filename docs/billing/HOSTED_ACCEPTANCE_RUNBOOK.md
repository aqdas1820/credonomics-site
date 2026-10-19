# Prepared hosted acceptance — no hosted execution in this assignment

Exact project: `jvpiulmcjjnsgozgqgzw`. No staging migration or resource is authorized here.
These tests supplement `STAGING_E2E_RELEASE_RUNBOOK.md`; do not replace the recovery gate.

## Preconditions controlled by the owner / infrastructure agent

1. Independently verify project identity, recovery evidence, Free-plan capacity and written
   approval for each infrastructure/migration action. Do not infer permission from these files.
2. After separately approved migrations/resources, verify hosted Auth configuration and
   application admin UUID allowlist + trusted `app_metadata.billing_admin` policy.
   Use two distinct owner-certified SYNTHETIC identities and a synthetic invoice with an
   already-created private archive. Customer OTP and customer-owned invoice mapping remain
   blocked until real approved WhatsApp authentication exists; do not fabricate that success.
3. Privately retain local verified browser storage states and fresh JWTs for those identities.
   Owner must confirm each state belongs to the corresponding JWT identity; the suite verifies
   JWT identity with Auth but does not automatically decode/bind browser cookies to those JWTs.
   Do not use customer accounts, service-role JWTs, screenshots, traces or GitHub secrets.
4. Record the independently verified synthetic PDF SHA-256 privately before the run. Verify
   existing bucket is private, create-only writes work and unprivileged upload/update/delete
   permissions are denied. No bucket or feature flag is changed by the prepared tests.

## Prepared read-only browser/API suite

`tests/staging/hosted-acceptance.spec.ts` adds three cases:

- Two distinct valid Auth identities with trusted admin metadata only on the intended admin.
- Admin GET returns exact PDF bytes twice matching independent hash/header; no-store,
  attachment, nonadmin denial and invalid-kind denial. Positive 200 prevents disabled APIs
  or missing migrations from masquerading as successful authorization testing.
- Exact pre-existing synthetic archive envelope denied via public, anonymous and ordinary-user
  Storage paths. No list, upload, overwrite or deletion. Access failure alone cannot prove
  bucket existence; the independent positive application read is required alongside this case.

The previous six opt-in smoke/PostgREST denial cases remain. 404/406 for a private unexposed
schema prove API inaccessibility, not row-level policy correctness. The application's current
contract denies all direct anon/authenticated access to billing_private and uses privileged
server RPCs after application authorization. Do not expose the schema just to make a test pass.

Owner-private environment setup, no values in shell arguments or logs:

- Existing suite: `BILLING_STAGING_E2E_APPROVED`, `BILLING_STAGING_E2E_ORIGIN` (dedicated approved
  HTTPS Vercel preview), `BILLING_STAGING_SUPABASE_URL`, `BILLING_STAGING_PUBLISHABLE_KEY`,
  `BILLING_STAGING_SYNTHETIC_INVOICE_ID`, `BILLING_STAGING_ADMIN_STATE`, `BILLING_STAGING_NONADMIN_STATE`,
  `BILLING_STAGING_NONADMIN_JWT`.
- Additional strict suite: `BILLING_HOSTED_ACCEPTANCE_APPROVED` equal to the exact project ref,
  `BILLING_STAGING_ADMIN_JWT`, `BILLING_STAGING_ARCHIVE_BUCKET`,
  `BILLING_STAGING_SYNTHETIC_PDF_SHA256`. All prerequisites are mandatory once enabled.
- Both approval variables equal the exact ref. URL is exactly the staging Supabase origin.
  Never set these merely to bypass a skip. Use owner-local private state files outside Git.

After separate authorization, the operator's command is:
`npx playwright test --config=playwright.billing-staging.config.ts`.
Keep traces/video/screenshots off; no HTML reporter or artifact uploads. Even a synthetic
test response must not be pasted into issues. Sanitize results to counts/statuses only.
The prepared suite performs no POST/DDL; existing cross-origin smoke POSTs must be denied
before side effects. Network approval is still required for those older smoke cases.

## Prepared SQL catalog acceptance

`tests/staging/catalog-acceptance.sql` is a READ ONLY transaction returning six booleans:
all expected tables exist; all enable RLS; anon/authenticated roles exist; no private schema
USAGE; no direct table DML privileges; no public billing RPC EXECUTE for either API role.
It reads system catalogs only and ends with rollback. It cannot establish project identity.
Only an independently verified existing connection may run it after separate authorization;
this assignment did not use a hosted connection or inspect credential availability.

The new twentieth LOCAL PostgreSQL test executes this exact query and verifies it detects
deliberately disabled RLS. Hosted execution and true hosted JWT-to-policy behavior remain
unverified. Existing local role/JWT shims cannot substitute for hosted Auth/PostgREST tests.
Any false boolean, skipped required case, missing identity binding or blocked direct API
baseline is a release blocker, not a permission to grant access or apply migrations.

## Additional destructive tests requiring a separate approved synthetic-only window

- Duplicate archive creation must return the immutable winner bytes; verify existing bucket
  policy denies overwrite/delete to non-service roles. Hosted create-only/concurrent writes
  are NOT run by this read-only suite.
- Missing bucket, cap, permission failure and corrupted envelope must fail closed with no
  regeneration. Do not corrupt a real archive or change a production policy to test this.
  Existing SDK-over-local-HTTP and filesystem recovery tests cover these contracts locally.
- Independently restore encrypted archive bytes plus retained HMAC key/version into an
  isolated recovery fixture; verify hashes and authorization. Verify retention inventory,
  capacity, lifecycle and privileged-delete controls. Application immutability is not WORM.
- Real PAID receipt eligibility, banked-credit evidence, customer session isolation, OTP
  compliance, YouPI license/security and merchant approval still need separate release evidence.

## Actual status

Local `--list`: 9 discovered. Without approvals the suite ran with **9 SKIPPED**, no remote
execution. New SQL was validated on disposable local PG17, including fault injection.
Hosted Auth/RLS/PDF archive acceptance: **NOT RUN / BLOCKED**. No resources, policies, flags,
migrations, customer fixtures, payments or credentials changed.
