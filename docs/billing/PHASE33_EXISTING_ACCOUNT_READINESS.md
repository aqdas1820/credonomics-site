# Phase 33 — existing current-account beneficiary and first-payment blockers

Status: **BLOCKED FOR REAL COLLECTION**. No hosted schema, production beneficiary,
credential, runtime flag, payment, bank statement, invoice or receipt was modified.

## Owner clarification (20 October 2026)

CredoNomics already owns a **current account** and has entered its existing UPI
identifier in the deployed YouPI system. Do **not** request a new bank account
or VPA. Existing entitlement and the source-to-destination account must still
be proved using official bank evidence. Slice is **not** the presumed bank.

## Read-only discovery

- AWS Sydney instance `i-0a71b217abd5c1367` running, SSM online.
- Private gateway `credonomics-youpi-private-gateway-1` present. No changes
  were made by the inspection commands.
- Existing `/app/data/youpi_pg.sqlite` contains
  `payment_receiving_accounts` with `upi_id`, `payee_name` and
  `is_merchant_enabled`; `payment_sessions.receiving_account_id` links
  sessions to the configured account. A separate bridge SQLite store exists.
- Standard container-env UPI key audit found no beneficiary fields under the
  names checked. SQLite appears to be the relevant source, **but the actual
  row/value, authoritative bank, account type, live payer-app resolution and
  owner match remain unverified**.
- No account identifiers, payee names, credentials, SQLite rows or secrets
  were printed, copied or committed.

The owner must verify in their official bank portal that the configured VPA is
attached to the specified CredoNomics current account. Independently confirm
the UPI-app-resolved **bank beneficiary name**, not merely the QR's `pn` field.
Owner must also identify the bank and actual statement/credit reference format.
Keep UPI PIN, OTP, bank login, bank statement and any secrets out of chat,
GitHub Actions logs and issue discussions. Preserve evidence privately.

## Bank adapter decision

The existing Phase31 configuration intentionally rejects all receiving banks
other than exactly `Slice`, and only permits `BUSINESS_CURRENT`. Its
`billing_verify_manual_upi_credit` RPC currently delegates to
`billing_verify_slice_credit`, which records `bank_name='Slice'`.
Never change a setting to `Slice` just to bypass this safety constraint.

- If the actual bank is **Slice**, establish it is an authorized business
  current account and retain official manual Slice booked-credit review.
- If the actual bank is **not Slice**, keep pilot and settlement OFF. A
  separately named, source-reviewed adapter must record the *actual* bank;
  preserve exact invoice/VPA/amount/UTR uniqueness, exclusive invoice locks,
  immutable bank evidence, original reviewer audit, receipt snapshot and
  idempotent retries. Add concurrency and bank-mislabel tests first.
- No automated SUCCESS, customer screenshot, QR scan or supplied UTR alone
  can produce a PAID invoice.

The physical account mapping is not proven here; no adapter for an unknown bank
can truthfully be claimed implemented or accepted.

## YouPI and commercial gates

The upstream `youpi-pg/YouPI-PG` repository's public root was inspected on
20 October 2026. It had no root LICENSE entry; a README describing the
project as experimental is not a sufficient commercial grant. Before
commercial activation obtain a clear applicable license from the rightsholder,
an independent security/reconciliation assessment and all required bank/
regulatory permissions. Even if licensed, automatic YouPI success must not
replace actual bank-booked credit verification.

Vercel Hobby is restricted to personal/non-commercial usage; plan eligibility
and a permitted zero-additional-cost host are not proven. Existing AWS synthetic
staging is not payment acceptance authorization.

## Windows recovery fix in this branch

GitHub Phase32 Windows job `118736560649` failed during `roles.sql` grant
replay: PG17 requires original `postgres` to have ADMIN grant authority.
A fresh `cn_restore_*` bootstrap was not the original grantor. The Phase33
patch initializes the isolated empty native cluster with local `postgres`
and reuses exactly the corresponding original source role, replacing only the
duplicate `CREATE ROLE postgres` line while retaining the source ALTER, other
role definitions and grants. Source must prove postgres SUPERUSER+LOGIN;
otherwise fail closed. Original role/ACL/row/sequence inventories still must
match exactly; no owner, immutable trigger or grants are stripped.

This change requires a green actual Windows PG17 CI roundtrip. It does NOT
prove recovery of the owner's real Supabase database. Hosted full recovery
remains blocked pending owner R: VeraCrypt export and isolated restore,
`supabase_vault` and other extension compatibility and external Auth/key
recovery. Target production project remains undesignated; only
`jvpiulmcjjnsgozgqgzw` **staging** was identified.

## Acceptance path — no collection until explicit approval

1. Privately prove the existing current-account/VPA ownership, determine its
   actual receiving bank and compare the real UPI-app beneficiary name.
2. Produce permitted independent/manual bank credit verification for that
   bank, with unit/native PG17 concurrency tests and safe provider labeling.
3. Complete real encrypted export **and** isolated restore, named production
   Supabase target, source/target migration hashes, and hosted Auth admin +
   nonadmin E2E without exposing secrets.
4. Verify legal commercial infrastructure and YouPI rights separately.
5. Obtain explicit owner approval for exact beneficiary mapping, hosted schema
   changes and flags, and then **separate** approval for one live test.
6. For that approved test only: invoice -> QR -> actual bank booked credit ->
   verified UTR/amount/beneficiary -> single immutable PAID receipt.

All real-collection, settlement and hosted schema activation gates remain OFF.

CI acceptance uses the existing Phase32 synthetic-only workflow, expanded to
run for PRs targeting the Phase32 branch. A successful synthetic CI run is
necessary but **not** permission for hosted DB operations or real collection.
