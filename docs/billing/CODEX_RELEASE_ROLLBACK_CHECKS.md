# Review-stage verification and rollback checklist

Scope: this engineering branch targets the billing feature branch, not main.
No release, bucket, SQL, credential or feature activation is authorized here.

## Source review and regression

1. Review the SDK duplicate-response fix: accept 409 and only the specific 400
   ResourceAlreadyExists code. Permission, missing-bucket, bad metadata and generic
   errors stay unavailable. Installed SDK tests run against loopback HTTP, not a
   replacement mock of storage methods.
2. Run `npm test`, `node --test prototypes/worker-market-api/worker.test.mjs`,
   `node scripts/test-billing-archive-recovery.mjs`, build, typecheck and lint.
   Recovery drill uses fabricated temp artifacts only and accepts no user paths.
3. Generate synthetic SSR fixtures with process-local BILLING_DOCUMENT_FIXTURES=1
   while running `npx vitest run app/billing/document-integrity.test.ts`, then run
   `npx playwright test --config=playwright.billing-local.config.ts`. The optional
   fixture flag must be removed afterward and never configured on a hosted app.
4. Run `python scripts/test-billing-postgres.py` only with BILLING_PG_DISPOSABLE=1
   and explicitly selected fresh loopback cluster. The suite creates/drops its own
   generated test database and applies review SQL locally; it never restores an
   owner backup. Do not point it at the owner's restore cluster or hosted staging.
5. List prepared staging cases via `npx playwright test
   --config=playwright.billing-staging.config.ts --list`. Actual hosted execution,
   verified sessions and synthetic fixtures belong to the approved infrastructure
   handoff. Preserve all existing secret/session/redaction safeguards.

## Infrastructure agent handoff — execute only after owner approvals

- Verify private bucket identity, positive integer size cap <= 2,000,000 bytes,
  application/json allowance, least privileges and anon/customer denial. Do not
  infer WORM from public=false. Verify provider behavior for duplicate 400/409.
- Keep source invoice/receipt authoritative snapshots bound to exact UUID, version
  and independently booked credits. Verify actual RLS and receipts only after the
  owner's separate migration and staging-write approvals.
- Independently retain archive envelopes, snapshot/digest inventory and integrity
  key custody; prove byte-identical PDF restoration on a separately approved
  environment. The synthetic filesystem drill is not hosted retention/recovery.
- Reconcile every issued document ID to an archive object, including failed first
  archival attempts; this implementation remains lazy at first authorized POST.
- Verify retention/legal hold/deletion policy with issuer/security owner. No archive
  deletion job or unreviewed service-role grant is proposed.
- Verify actual provider/hosting entitlements before considering the Worker subset.
  Do not move token files, remove Railway volumes or discontinue the persistent
  feed based on this prototype. No infrastructure change request was sent.

## Rollback criteria for a separately approved future release

Hold or disable the archive feature through an authorized configuration change on
any integrity-tag/hash mismatch, wrong invoice binding, auth/RLS disclosure,
missing objects, failed persisted read-back, inconsistent bank credits or recovery
failure. Never repair a bad archive by overwriting it or regenerating an original.
Retain evidence privately; revert source via a normal reviewed commit while
preserving concurrent work. No force-push, financial-record rollback or deleting
history. An app rollback does not reverse database changes; SQL rollback needs its
own reviewed recovery plan. Existing HMAC key/version remains compatible: do not
rotate/delete it during source rollback. Re-run denied-access and original-byte
retrieval checks before separately authorizing reactivation.

The repository Vercel guard disables automatic deployment for this exact Codex
branch only, preserving the existing cron and other branch defaults. It exists to
keep publishing a review PR from implicitly authorizing a deployment. Verify that
policy before any future preview release; no hosted settings were modified.
