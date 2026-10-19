# Phase 18 — Verified free CI and production release gates

Date: 2026-10-18. Repository: `aqdas1820/credonomics-site`. **DRAFT PR #1 only**. **No production release authorized.** ₹0 new spend.

## New testing infrastructure committed

- Created `.github/workflows/billing-postgres-validation.yml` on feature branch in commit `9921bc447162bc67e42580909e75a1ac41f30e93`.
- Runs in GitHub's **standard Ubuntu hosted runner** in this **public** repository. No repository secrets are exposed, no artifacts uploaded, no external payment/DB endpoints used. `permissions: contents: read` and `persist-credentials: false`.
- PostgreSQL 17 Docker service is disposable and runner-local. `scripts/test-billing-postgres.py` independently creates and drops a new UUID-named test DB with synthetic records, checks `BILLING_PG_DISPOSABLE=1`, rejects non-loopback remote addresses and service-file overrides.
- Commit `6bce6ec57cff5e42b8f45d49adac58bb5c380e5e` extended paths to relevant billing/SQL/policy changes.
- Commit `ade2ce951bd8a6a99feed0c71fe11a547424dc8a` added separate full source validation job (locked `npm ci`, `npm test`, `npm run build`, `npm run typecheck`, `npm run lint`) on the same free runner type. Node 22 action and checkout action are commit-pinned.

## Evidence, exact commits and logs

1. Initial PostgreSQL workflow: **PASS** (run ID `39116287205`) at commit `9921bc447162bc67e42580909e75a1ac41f30e93`. Job `117642630148`. Logs show `Ran 19 tests in 5.672s\nOK` and `APPLIED LOCAL ONLY` for SQL 012→016.
   - https://github.com/aqdas1820/credonomics-site/actions/runs/39116287205
2. Latest full CI run: **PASS**, run ID `39116483910`, commit `ade2ce951bd8a6a99feed0c71fe11a547424dc8a`.
   - PostgreSQL job `117643212652`: **PASS, 19 synthetic integration tests** (runner-local only).
   - Source job `117643212883`: **PASS, 188/188 unit tests (31 files); 116/116 billing tests (15 files)** during prebuild; `npm run build` compiled successfully; sequential `npm run typecheck` and `npm run lint` completed successfully. Non-blocking Next/build and deprecation warnings remain.
   - https://github.com/aqdas1820/credonomics-site/actions/runs/39116483910
3. The complete CI is **not** a hosted Supabase/PostgREST/authenticated-browser test, actual Slice booked-credit check, provider webhook contract or customer OTP delivery test.

## Database identity / immutable safety boundaries

- Independently verified staging identity from Supabase: organization `CredoNomics Staging`, project ref `jvpiulmcjjnsgozgqgzw`, `ACTIVE_HEALTHY`, Free. Previous read-only check found **no `billing_private` schema, no billing RPCs** and four pre-existing nonbilling migrations.
- **Nothing from Phase 18 was executed on staging**. No DB migrations, real invoice issuance, user/customer reads, live banking, payment collection, Vercel production deploy, PR merge or paid service activation.
- GitHub Actions standard runner is free for public repos; this workflow does not request larger runners, use caches beyond ordinary node setup, or store artifacts. Verify billing periodically; free service availability/limits can change.
- Supabase Free has **no automatic daily backup** and **no point-in-time recovery**. Manual logical export and tested restore are required before changing existing staging (official backup docs).
  https://supabase.com/docs/guides/platform/backups

## Fastest safe staged release plan

**Stage 0 — completed:** CI/runtime gate on disposable PostgreSQL. Maintain source-only feature development; keep Draft PR and flags disabled.

**Stage 1 — next:** Owner runs an encrypted **private** local export of existing staging database (roles/schema/data, where authorized) into a folder **outside the repository**, then validates a restore into a separate disposable offline Postgres/Supabase-compatible environment. Follow official instructions without pasting credentials in chat:
https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
Record verified restore timestamp, schema count, object/row counts and recovery limitations privately (no customer PII in PR). Check storage file backups separately if Storage API objects exist.

**Stage 2 — requires explicit approval for EXACT project ref after recovery:** Review migrations 012→016, pre-existing schema/event triggers, RLS/definer role/PostgREST auth semantics and migration rollback. Only after the owner approves exact staging project `jvpiulmcjjnsgozgqgzw`, apply reviewed SQL in controlled order for a **private test pilot only**. Never touch CardLedger or production.

**Stage 3 — private staging E2E:** Test genuine Supabase JWT/service-role allowlist, denied anon/authenticated RPCs and browser routes, invoice issuance/history/print, concurrency/idempotency and strict bank-credit attestation **with synthetic test data only**, and archived PDF binary integration. Bank `SUCCESS` observations cannot set `PAID`.

**Stage 4 — external commercial/privacy blocker:** Verify authorized YouPI-PG V2 merchant license, runtime/merchant contract and beneficiary/VPA, bank-booked evidence workflow and compliance. **Real WhatsApp authentication OTP cannot be assumed sustainably ₹0**; obtain a verified lawful free entitlement/path or explicitly approve a changed functional requirement. Do not substitute mock OTP, gateway pre-checkout OTP or unverified phone fields.

**Stage 5 — release sign-off:** Verify legal issuer/address/tax applicability, refunds/credit-note and retention workflow, true archived immutable PDFs, official gateway+bank E2E, threat model, rate limits and monitoring; then independently approve production release and payment enablement. Passing CI alone does NOT authorize merging `main` or collecting money.

## Operational release blockers as of this report

| Area | Status |
| --- | --- |
| GitHub code/SQL source + reproducible unit/build tests | Verified on CI |
| Disposable Postgres 17 migrations 012–016 and 19 concurrency/security cases | Verified on CI |
| Supabase Free staging identity and health | Verified, READ-ONLY |
| Complete, secure manual backup and proven restoration of staging | BLOCKED |
| Applying billing schema to approved staging | NOT DONE / NO-GO |
| Real PostgREST + Supabase Auth E2E | NOT DONE |
| WhatsApp customer OTP at guaranteed ₹0 | NOT RESOLVED |
| YouPI merchant licensing, legal usage, merchant/beneficiary binding | NOT RESOLVED |
| Official Slice booked-bank credit evidence E2E | NOT DONE |
| Immutable archived and delivered PDF binary | NOT DONE |
| Production PR merge or live money collection | NOT AUTHORIZED |

**Next human dependency:** confirm who will perform the secure staging export and restore test, and whether WhatsApp OTP is non-negotiable given the strict zero-cost condition. Never request or expose passwords, tokens, private database dumps or real customer records in chat.
