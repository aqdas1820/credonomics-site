# Billing staging E2E and external release gates

2026-10-18. Feature source only. **NO GO**. Project `jvpiulmcjjnsgozgqgzw`.
This runbook is preparation, not permission to migrate, seed staging, send OTP,
activate a provider or collect money. Use synthetic data only. Spend limit INR 0.

## Executable suites

- `npm test`: synthetic unit/domain/route/store-adapter tests, not real RLS proof.
- `npm run build`, `npm run typecheck`, `npm run lint`: source validation, no deployment.
- `npx playwright test --config=playwright.billing-local.config.ts`: loopback-only
  built-server denial tests. The launcher forces billing/archive flags off,
  removes the service-role/integrity keys from its child environment, refuses
  server reuse and never starts a remote integration.
- `npx playwright test --config=playwright.billing-staging.config.ts --list`:
  prepares/lists four remote cases without contacting staging. Real execution
  needs owner-local origin and exact-ref opt-in, then separate E2E approval.

The staging config accepts only a dedicated HTTPS Vercel preview origin; owner
must verify that preview's backend is exactly staging and is not production.
Never point it at the production site. Set `BILLING_STAGING_E2E_APPROVED` to the
exact approved project reference only after approval; this is a local guard,
not proof that permission was granted. `BILLING_STAGING_E2E_ORIGIN` is the approved
preview origin; never include credentials. `BILLING_STAGING_SYNTHETIC_INVOICE_ID`
must be an owner-provisioned synthetic invoice UUID. Private existing verified
session files may be referenced via `BILLING_STAGING_ADMIN_STATE` and
`BILLING_STAGING_NONADMIN_STATE`; keep files encrypted outside Git/cloud sync.
Do not send sessions to chat or upload artifacts. Traces/video/screenshots are
off. No new users or fixtures are provisioned by this suite. Authenticated cases
skip without the corresponding fixtures. A skip is not a PASS.

## Required verification matrix after blockers are resolved

| Area | Required positive and negative evidence | Current status |
| --- | --- | --- |
| Recovery | Roles/schema/data/history/custom auth/storage, binary coverage, independent decrypt/restore, hashes and original preservation | DB backup/restore blocked; synthetic encryption recovery separately passed |
| Hosted identity | Valid, expired, revoked and tampered JWT; server-verified user; fake user_metadata admin; allowed versus unlisted admin; admin removal invalidates access | Local mocked denials implemented; hosted tests not run |
| RLS/PostgREST | anon and ordinary authenticated users cannot select/insert/update/delete private invoices, receipts, bank evidence or observations, nor call privileged RPCs; service scope exact | 19 historical synthetic PostgreSQL cases are not hosted evidence; do not apply migrations to run these |
| Invoice authority | Server numbering and paise arithmetic; no client status/owner/price overwrite; immutable customer/lines; concurrent SYSTEM event retries exact/conflict | Unit coverage; staging race/transaction validation pending |
| Customer invoice access | Real verified phone/subject-to-invoice ownership; customer A cannot read customer B; guessed IDs and revoked sessions denied | Customer access remains unavailable; no public PDF URL or fake OTP route added |
| OTP | Authorized delivery, consent, single use, expiry, replay and simultaneous verification, resend invalidation, bounded attempts, durable per-phone/IP/account throttling, generic responses, signed invoice/subject challenge binding | Requires actual approved official provider and verified no-cost terms; no messages sent |
| Archive | Verified private bucket; public/anon/customer denial; no overwrite/delete; exact original PDF bytes after repeated download and independent storage recovery; key recovery; concurrent create | Source tests cover these boundaries with synthetic PDFs/mocked store; actual bucket/RLS/retention/recovery not run |
| Gateway | Licensed version, fixed beneficiary/merchant/currency/order/amount, valid/tampered raw signatures, invalid UTF-8, events and replay conflicts; no COD/browser success as bank evidence | Local observation contract hardened; no upstream deployment/checkout |
| Bank/receipt | Authoritative booked Slice credits and UTR uniqueness; partial/full/over-credit; different invoice same UTR; receipt only from distinct immutable full-credit snapshot | Synthetic tests only; no live bank evidence or payments |
| Operational release | Issuer/tax/privacy/corrections/retention, monitoring and denial audit, incident/recovery/key custody, final reviewed exact-commit CI and owner approval | Blocked; main merge/payment activation require separate permission |

Do not simulate money as actual bank verification in staging. Any future write
tests need explicit synthetic-fixture approval, approved temporary operator roles
and cleanup strategy preserving audit records. No load/abuse test against a live
provider is authorized. Record only counts/pass-fail/sanitized commit references.

## Exact external evidence still needed

| Owner/provider | Evidence needed before activation |
| --- | --- |
| YouPI rights holder | Written commercial use/hosting/integration/redistribution rights for CredoNomics and an exact reviewed version; fee/renewal/hosting conditions compatible with INR 0. Public code and claims of zero transaction fees do not grant a license. Current root LICENSE fetch returned 404; no usable grant established. [Upstream](https://github.com/youpi-pg/YouPI-PG) |
| YouPI security/merchant operator | Independently reviewed closure of attribution, secret exposure, observer access, COD/SUCCESS, mutable beneficiary and OTP abuse reports; signed protocol/version, merchant identity, fixed beneficiary/VPA and immutable invoice/amount binding, replay/conflict behavior, secret rotation and incident handling. Older issues in Phase 19 are public reports, not newly reproduced findings. |
| Meta or authorized WhatsApp provider | Legitimate official business account, sending number/display name and required business verification, approved authentication template/language, consent/privacy basis, scoped credential custody and signed webhook contract. Written recurring no-charge entitlement including provider/hosting/message/renewal costs and expiry conditions. No Baileys/Berry substitution or trial assumed sufficient. |
| WhatsApp financial owner | Meta documents delivery-based category/market pricing; free service replies or conditional entry windows do not establish unrestricted recurring free OTP. Owner must obtain applicable no-charge entitlement or separately revise the INR 0 constraint; no paid activation allowed. [Official pricing](https://business.whatsapp.com/products/platform-pricing) |
| Merchant/issuer and receiving bank | Approved legal issuer details/tax position, beneficiary account/VPA ownership and permission for this receipt/collection use, lawful bank evidence source, reconciliation operator, refund/dispute/correction policy. Gateway observations cannot replace bank confirmation. |
| Infrastructure/security owner | Existing no-cost private archive capacity, access/retention controls, independent HMAC-key recovery, verified storage recovery and lifecycle policy. No bucket/resource created or plan upgraded by this work. |
| Project owner | Decision on missing existing DB credential or separately approved rotation impact plan; then tested backup/restore, exact-ref migration review/approval, staging E2E, finally separate production merge/deploy and live-collection approvals. |

The shortest path is to resolve credential ownership and external entitlements in
parallel with source CI. No source implementation can supply a license, account
approval, merchant rights, recurring free OTP entitlement or tested staging backup.
All-at-once launch stays blocked until every manifest gate and owner release signoff
is independently verified. Do not silently switch providers or weaken requirements.
