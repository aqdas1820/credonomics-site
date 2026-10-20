# Billing persistence and access-control review

**Status: design only. SQL is not applied to Supabase.**

## Safety boundary
The current /billing page is public-facing, client-side and must remain sample-data-only until an authenticated admin-only route and secure persistence exist. Never put service-role secrets into NEXT_PUBLIC variables or client components. No customer invoice lookup without real WhatsApp OTP.

## Schema
See `docs/billing/012_billing_private_review.sql`. The tables are intentionally in a private schema with no grants to anon/authenticated and RLS enabled without policies. A server-side authenticated operator workflow is required before any database changes.

## Critical implementation requirements
- Generate unique invoice numbers atomically in the database, not client-side; lock or use a sequence with a unique constraint.
- Compute and validate totals server-side in integer paise; verify lines sum to invoice total in the same transaction.
- Verify Slice booked credits outside YouPI, with real operator authentication and evidence; duplicate UTR must fail.
- Never allow direct client edits to status or evidence; use transaction with row locking and audit events.
- Separate draft/issued immutable PDF revisions. UNPAID must not imply collection; PAID only after total independently confirmed bank credits.
- Do not expose customer PII through preview deployments or logs.
- No new paid service, deployment resource, or hosted schema mutation without approval.
- Confirm existing Supabase migration conventions, schema compatibility and RLS policy audit before applying SQL.
