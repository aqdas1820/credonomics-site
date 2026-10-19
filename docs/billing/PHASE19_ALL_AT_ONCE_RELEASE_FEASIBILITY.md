# Phase 19 — Full launch preconditions, external dependencies and safe owner actions

**Date:** 2026-10-18. **Mode:** all components released together only after independent approval. **Spend:** strict additional ₹0. **Launch:** NO-GO. **Source branch:** `feature/youpi-payment-entry-prelaunch`. **Production `main` untouched.**

## Work completed in this phase

- Confirmed PR #1 is still DRAFT and the feature commits have not been merged to `main`.
- Supabase read-only: `CredoNomics Staging` (Free), project `credonomics-staging` exact ref `jvpiulmcjjnsgozgqgzw`, `ACTIVE_HEALTHY`.
- Read-only catalog preflight (no data exported): database approx **11 MB** inclusive of system objects, **six** public tables, **zero** Supabase Storage buckets, **zero** stored objects and **no `billing_private` schema**. Counts and database size do not prove recoverability or that there is no personal data.
- Baseline CI [run #39116483910](https://github.com/aqdas1820/credonomics-site/actions/runs/39116483910): 188/188 unit tests, 116/116 billing tests, 19/19 synthetic PostgreSQL cases and build/typecheck/lint pass. This does **not** prove hosted Supabase JWT/PostgREST, real OTP or payment operation.
- Added `docs/billing/ALL_AT_ONCE_RELEASE_GATES.json`, a public **evidence manifest** containing no secrets/customer data, and `scripts/check-billing-launch-readiness.mjs` with fail-closed validation of 13 required criteria and separate owner release approval. Added `--self-test` and `--assert-blocked` to feature CI so the current launch remains NO-GO by design. The checker **does not authorize deployment** or independently prove evidence; it is a tracking safety barrier.

## Licensing: real upstream audit, not inferred rights

- Upstream GitHub repository is now [youpi-pg/YouPI-PG](https://github.com/youpi-pg/YouPI-PG). Its README states **commercial / sovereign licensing**, pointing to `LICENSE`; however the current repository root does **not** include LICENSE, and GitHub repository API returns `license: null`. Public source visibility is not an explicit grant of permission for commercial hosting, redistribution or derivative code.
- Do **not** copy upstream gateway code, install it in a production merchant environment, or commence money collection until the actual rightsholder supplies written terms/permission applicable to CredoNomics and any cost is independently verified to be ₹0.
- Current upstream open issue reports include:
  - [#22](https://github.com/youpi-pg/YouPI-PG/issues/22), claimed fallthrough from verification rejection to amount-only payment attribution.
  - [#23](https://github.com/youpi-pg/YouPI-PG/issues/23), claimed exposure of merchant secrets through public checkout branding state.
  - [#24](https://github.com/youpi-pg/YouPI-PG/issues/24), claimed unrestricted Android notification forwarding.
  - [#26](https://github.com/youpi-pg/YouPI-PG/issues/26), claimed COD orders emitting normal SUCCESS even without bank credit.
  - [#27](https://github.com/youpi-pg/YouPI-PG/issues/27), claimed mutable UPI beneficiary on open sessions.
  - [#9](https://github.com/youpi-pg/YouPI-PG/issues/9), claimed OTP brute-force/rate-limit and token issues.
  - [#28](https://github.com/youpi-pg/YouPI-PG/issues/28), claimed unsafe reset/backup/audit handling.
- These are **unresolved public reports, not independently reproduced findings**. Require upstream fixed code, reviewable commit references, independent tests and merchant-specific threat review before any gateway integration. Existing CredoNomics logic is intentionally stricter: signed gateway SUCCESS remains review evidence, never booked Slice credit or automatic PAID receipt.

## WhatsApp OTP: guaranteed ₹0 not established

- Public 2026 pricing analyses of the official Meta WhatsApp Business Platform report India **authentication template messages are chargeable** per delivered OTP, and rates/providers vary. Independent written Meta/provider pricing and owner authorization are required; do not enter billing details or enable a chargeable product under a ₹0 rule.
- Upstream YouPI README describes a Baileys/Berry protocol socket rather than a verified official WhatsApp Business Platform credential. Its use, WhatsApp terms, reliability and security have **not** been authorized for CredoNomics; do not use that unofficial channel as a ₹0 workaround.
- Real secure customer invoice access requires authorization to send actual OTPs, consent, expiry, one-time challenge consumption, per-phone/IP/device throttles, resend/attempt lockouts, signed server-side customer/invoice binding, no reusable checkout OTP without proof, and auditable denial of unauthorized invoice reads. No mock messages, public invoice lookup or simulated OTP acceptance.
- **Feasibility conflict:** if no legitimate recurring ₹0 WhatsApp OTP route or actual licensed YouPI entitlement exists, then **all-at-once launch cannot meet both mandatory features and additional ₹0**. Stop and ask the owner for a revised constraint or independently documented no-charge entitlement; never silently switch to another medium, paid tier or unofficial gateway.

## Staging recovery: next exact manual dependency

The staging connector provides project/table catalog inspection but does **not** supply a tested backup/restore service. The project is **not** an expendable database. A controlled backup and restore test must be run by an authorized owner using their own local machine and permitted tools; **do not** send DB credentials, dumps or customer data into ChatGPT or public CI.

1. Verify project ref `jvpiulmcjjnsgozgqgzw`, available local disk space and free-plan backup limits directly in the Supabase dashboard. Existing database approx 11 MB is **not** a substitute for backup capacity planning.
2. Follow [Supabase Backup & Restore guidance](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) to export all relevant schemas/roles/data as authorized; keep encrypted artifacts **outside the Git repository**, and check extensions/auth/storage coverage.
3. Independently restore into a **separate disposable local** compatible PostgreSQL test environment, never a production or CardLedger project. Verify restored schema, expected object counts, relevant data/role permissions, rollback process and restoration time. Keep confidential proof in owner's protected storage, and place only non-sensitive validation metadata in the public PR.
4. Only after a recovery plan is actually proven can an owner issue a **separate exact-ref staging-only approval** for SQL 012→016. Zero live billing flags, payments, Vercel production deploy, `main` merge or customer messages until later independent gates.

## Engineering sequence after proof, not before

1. **Real staging pilot:** PostgREST JWT/allowlist checks, RLS denied paths, concurrency, private invoice CRUD, partial/full Slice attestation, refusal of fake payment evidence. Synthetic records only, no fake claim of bank credits.
2. **Invoice archive:** generated immutable versioned PDF binaries, access-controlled retrieval, retention/restoration and receipt issuance only after full booked-credit attestation.
3. **Customer identity:** owner-licensed official WhatsApp OTP delivery with ₹0 entitlement proof, privacy/consent and single-use verification; proof binds to specific customer/invoice, with strict rate controls.
4. **Gateway:** written YouPI merchant rights, fixed upstream security issues, approved immutable VPA/amount invoice→order binding, genuine provider contract tests and bank-official reconciliation; no gateway success alone pays.
5. **Owner release:** legal issuer/tax/refund/credit-note policy, threat modeling, monitoring, reviewed production environment configuration, end-to-end private testing, and explicit separate authorization for `main` merge/payment activation.

## Necessary owner decisions (not approval assumed)

- Who can **privately run and verify the staging backup/restore** using existing free local tools?
- Does the owner have **written YouPI commercial permissions** and an independently verified official **₹0 recurring WhatsApp OTP entitlement**? Links to public documentation are acceptable; do not paste credentials or private contracts here.
- Which issuer legal name/address, tax status, Slice beneficiary ownership, policies and permissions will legally govern actual customer invoices?
- No migration/merge/payment authorization has been given in this phase. Current status: **NO-GO**.

**Source of truth:** `docs/billing/ALL_AT_ONCE_RELEASE_GATES.json`. Passing a release checker is not financial compliance approval.

## Post-implementation validation

- Feature CI run [#39118069571](https://github.com/aqdas1820/credonomics-site/actions/runs/39118069571) at source-checker commit `3ede141560aaab38ad229d56876f0cc1defbe438`: both jobs **PASS**.
- Source job logs show the new release checker self-tests **PASS 5**, documented release state **NO GO: 2/13 gates VERIFIED, 11 BLOCKED**. Full unit tests **188/188**, billing prebuild tests **116/116**, Next.js production build success, TypeScript/lint success.
- Disposable PostgreSQL job **PASS** again for all 19 synthetic cases. No actual Supabase staging billing migrations or live-payment calls.
- This documentation addition was committed *after* that CI run; do not call the new document a separately build-tested implementation.
