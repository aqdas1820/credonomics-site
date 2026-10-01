# Dedicated Supabase staging setup

Updated 2026-09-30. **The four repository migrations are now applied to dedicated staging only.** Local CLI link is `jvpiulmcjjnsgozgqgzw` (`credonomics-staging`), explicitly distinct from the previous Production link `tpllgtskvvkronmbxkmg`. Vercel environments and local application credentials have NOT been changed. Do not use old Preview deployments or local credentials for write QA.

## Current cutover action required

Release gate passed: typecheck, lint, 277 tests in 28 files, and build. Staging was confirmed empty before CLI migration. Hosted history contains all four versions; six tables have RLS enabled, seven policies, fourteen indexes, twenty constraints, three application functions, and the enabled signup trigger. Notification UPDATE is restricted to read_at. All application tables and auth.users still contain zero rows. No seed data was needed. Evidence: `artifacts/staging-schema-verification.json`; reproducible read-only query: `scripts/site/verify-staging-schema.sql`. Do not reapply the initial migration using SQL Editor.

Enter these directly in **Vercel > credonomics-site > Settings > Environment Variables**, scoped to **Preview only**. Leave Production entries unchanged. If an existing entry shares Production/Preview scopes, preserve its Production value and make a separate Preview entry. Remove or update any branch-specific Preview override that would select Production values.

| Variable | Exact value / source |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | `https://jvpiulmcjjnsgozgqgzw.supabase.co` |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | The publishable key from **credonomics-staging > Settings > API Keys**; copy directly into Vercel, not chat. |
| SUPABASE_SERVICE_ROLE_KEY | The legacy **service_role** key from this same staging project's API Keys page; server-only, copy directly into Vercel, not chat. |
| SUPABASE_BACKEND_ENV | `staging` (server-only) |
| SUPABASE_STAGING_PROJECT_REF | `jvpiulmcjjnsgozgqgzw` (server-only) |
| CRON_SECRET | A separate staging-only random secret, entered directly in Preview, required before CRON QA. Preserve Production's secret. |

Do not manually override platform-managed VERCEL_ENV. Both guard variables are required; source verification confirms the URL must match the exact HTTPS staging hostname. No hosted writes through the app or Preview deployment will proceed until the user confirms both environment and OAuth setup below. Saving variables alone does not change existing deployments. [Vercel environment scopes](https://vercel.com/docs/environment-variables).

### Exact staging OAuth configuration

Google Cloud > OAuth Web Client > Authorized redirect URIs: **add**

`https://jvpiulmcjjnsgozgqgzw.supabase.co/auth/v1/callback`

Retain all Production callbacks. In **credonomics-staging > Authentication > Sign In / Providers > Google**, enable Google and enter the matching client ID/secret directly. Do not put the Google secret in chat or repository files. [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

In **credonomics-staging > Authentication > URL Configuration**:

- Site URL: use the current Preview origin, without a path. Latest repository-recorded Preview is `https://credonomics-site-56y7gvthx-aqdasshaikh1820-9566s-projects.vercel.app`. Its current/latest status could not be independently confirmed because the Vercel connector returned team-scope 403. Check the latest Ready Preview in Vercel before choosing the Site URL. A stable Preview alias is preferable if already available; never use the Production domain here.
- Redirect URLs for that recorded origin: `https://credonomics-site-56y7gvthx-aqdasshaikh1820-9566s-projects.vercel.app/**` (covers `/auth/callback` and its validated `next` query).
- To permit the forthcoming generated Preview URL without opening all Vercel projects: `https://credonomics-site-*-aqdasshaikh1820-9566s-projects.vercel.app/**`. Alternatively add the exact new Preview origin with `/**` after deployment and update Site URL before login QA.
- Local redirects are optional and staging-only: `http://localhost:3000/**` and `http://127.0.0.1:3000/**`. They do not authorize use of existing local Production credentials.

[Supabase redirect allowlists and wildcard rules](https://supabase.com/docs/guides/auth/redirect-urls). OAuth setup is documented, not remotely configured or verified in this session. The old Preview has not received this checkout's safety code or the new environment.

### Resume gate

Wait for explicit user confirmation that Preview variables and staging OAuth are saved. The connected Vercel app currently lacks access to team `aqdasshaikh1820-9566s-projects`; reconnect it to that team before using it for deployment. Deploy this current checkout to **Preview only**, then verify server-side deployment/environment evidence maps Preview to `jvpiulmcjjnsgozgqgzw` and Production to `tpllgtskvvkronmbxkmg`. A public auth-safety boolean alone is insufficient proof. Fail closed on any mismatch. Full two-user/browser/CRON and Alert Engine QA remain pending; no QA users have been created.

## Required topology and cutover order

| Application scope | Backend | Write policy |
| --- | --- | --- |
| Vercel Production | Existing Production Supabase | Existing behavior; no configuration changes in this batch |
| Vercel Preview before cutover | Existing Production Supabase | Application writes/auth initiation/CRON blocked by the new guard |
| Vercel Preview after cutover | Dedicated staging project | Enable only after schema, keys and OAuth are verified |
| Local development | Explicit staging or local Supabase | Never assume the existing `.env.local` is safe for writes |

1. DONE: authenticated project metadata confirmed the dedicated staging project and its distinct reference. No Production users, personal data, tokens or passwords were cloned.
2. DONE: CLI applied the exact migrations below in order to verified empty staging and recorded their history. Do not rerun the initial migration in SQL Editor.
3. Configure staging Auth and Google OAuth as below. Do not remove or edit Production redirect entries.
4. In the existing Vercel project's **Preview scope only**, set the staging URL, staging publishable key and staging service-role key. The user must enter the service-role key directly in Vercel, **never in chat**. Inspect branch-specific overrides, which can otherwise retain old values.
5. Set `SUPABASE_BACKEND_ENV=staging` and `SUPABASE_STAGING_PROJECT_REF=<staging-project-ref>` in Preview only after confirming the URL and keys belong to that new project. Unknown/unconfigured Preview stays locked.
6. Create a fresh Preview deployment. Public URL/key values are embedded at build time, so old deployments do not change when variables change. Never promote a staging-backed artifact to Production.
7. Read `/api/auth/safety`: it should report `mutationsAllowed: true` only on the newly verified staging Preview. Confirm the new deployment's Supabase request hostname is staging, without printing keys or session tokens.
8. Only after the user's configuration confirmation: create two staging-only QA users through Auth, validate signup triggers, perform two-user RLS and full alert mutation/trigger QA, then clean up only those explicitly identified staging fixtures.
9. Use a fresh browser context after cutover. Old Preview deployments and old local credentials still target Production; do not use them for QA. Do not share Production sessions with staging.

## 1. Database schema and execution order

All paths are relative to this repository. Supabase provides `auth.users`, `auth.uid()`, and the `anon`, `authenticated`, and `service_role` roles; do not recreate these on hosted Supabase.

| Order | Migration | Dependencies and effect |
| --- | --- | --- |
| 1 | `supabase/migrations/20260902_cloud_accounts.sql` | Enables `pgcrypto`; creates profiles, watchlists, watchlist_items, alerts, notifications, ownership policies and signup trigger. Depends only on Supabase Auth, not existing users. |
| 2 | `supabase/migrations/20260928_atomic_alert_notifications.sql` | Requires alerts/notifications; creates legacy atomic `trigger_price_alert`. |
| 3 | `supabase/migrations/20260929_alert_engine_v2.sql` | Requires preceding schema; adds alert entity/cooldown/dedupe metadata, notification delivery fields, expanded status and `trigger_alert_v2`. |
| 4 | `supabase/migrations/20260930_alert_safety.sql` | Requires V2 columns; restores explicit alert-type/entity checks, adds notification event uniqueness, replaces trigger with locked atomic deduplication, limits user notification updates to read_at, and creates missing IPO reference table. |

The Supabase migration CLI was used for this project; its history is populated. Continue using it consistently. SQL-editor application does not automatically populate CLI migration history. Every remote command in this session pinned staging explicitly after checking the local link. Avoid implicit linked-project commands, `db reset`, and Production connection strings.

Migration 1 is an initial schema migration, **not rerunnable** over an existing schema. Apply it once to a clean project. Migrations 2/3 use replace/conditional additions as appropriate; migration 4 is repeatable after its prerequisites. Replaying migration 3 after migration 4 would replace the hardened RPC, so never reorder them. Migration 4 stops if historical duplicate non-null event identities exist; it does **not** delete or merge data. Existing unsupported alert types/entities can also block its CHECK constraints and require deliberate review. Clean staging has neither condition.

The full chain and repeat application of migration 4 are executed by `tests/unit/staging-migrations.test.ts` using embedded PGlite PostgreSQL with local synthetic Auth prerequisites. This proves SQL/schema/trigger behavior in an isolated engine, not hosted Supabase configuration or concurrent multi-connection behavior.

### Tables

| Table | Required columns / purpose |
| --- | --- |
| profiles | Auth user ID PK/FK with cascade; email, display_name, avatar_url, created_at |
| watchlists | UUID PK, user_id FK, name (1–40), position (0–100), created_at, updated_at |
| watchlist_items | UUID PK, watchlist_id cascade FK, instrument_key, symbol, exchange (NSE/BSE), company_name, created_at |
| alerts | UUID PK, user_id cascade FK, instrument identity fields, alert_type, threshold, status, created_at, triggered_at, last_evaluated_at; V2 entity_type, updated_at, cooldown_until, trigger_count, dedupe_key, source, metadata |
| notifications | UUID PK, user_id cascade FK, alert_id cascade FK, type, title, message, created_at, read_at; V2 channel, event_id, delivery_status, failed_at, error_code |
| ipos | Public reference data: slug text PK, company_name, nullable open_date/close_date/listing_date (date), source_url, observed_at. Needed by the existing IPO evaluator; absent from the older schema. |

There are **no** repository migrations/tables for saved research, generic tracked entities, followed IPOs, or personal mutual-fund portfolios. Do not invent or copy such tables. Stock tracking is watchlists/items; MF pages currently consume public files/provider responses. IPO alert creation remains a product/API gap; the evaluator/reference schema does not by itself implement a follow/create UI.

## 2. RLS policies and grants

RLS is enabled on all six tables.

| Policy | Role / operations | USING and WITH CHECK |
| --- | --- | --- |
| profiles_own | authenticated / ALL | `id = (select auth.uid())` on existing and proposed rows |
| watchlists_own | authenticated / ALL | `user_id = (select auth.uid())` on existing and proposed rows |
| watchlist_items_own | authenticated / ALL | Parent watchlist must belong to `auth.uid()` on existing and proposed rows |
| alerts_own | authenticated / ALL | `user_id = (select auth.uid())` on existing and proposed rows |
| notifications_own | authenticated / SELECT | `user_id = (select auth.uid())` |
| notifications_update_own | authenticated / UPDATE | Same ownership predicate on existing and proposed rows; grants further limit update to `read_at` |
| ipos_reference_read | anon, authenticated / SELECT | `true`: public, non-personal reference records |

Anonymous privileges are revoked on user tables. Authenticated users have select/insert/update/delete grants on profiles/watchlists/items/alerts, constrained by RLS. Notifications allow select and column-level update(read_at) only; no INSERT/DELETE RLS policies exist. IPO reference writes are service-role only. Service role bypasses RLS and must remain server-only; no normal dashboard or notification request uses it after this batch.

## 3–4. Functions and triggers

| Object | Behavior / permission |
| --- | --- |
| `handle_new_user()` | SECURITY DEFINER, empty search_path; signup inserts own profile and default `My Watchlist`. Trigger function has no public/anon/authenticated execute grant after hardening. |
| `on_auth_user_created` | AFTER INSERT on auth.users, executes handle_new_user. No preexisting user requirement; migrating after users already exist does not backfill them. |
| `trigger_price_alert(uuid)` | Legacy active→triggered + notification in one transaction; service_role execute only. No current API route imports the legacy evaluator. |
| `trigger_alert_v2(uuid,text,text,text,interval)` | Service-role-only; locks alert, checks active/cooldown, atomically inserts unique notification then updates count/status. Duplicate identity returns false; any persistence error rolls back. Non-null cooldown must be positive; current price evaluator uses 1 day. |

No external email/push delivery is implemented by these RPCs: `IN_APP/SENT` means the in-app row was persisted. Do not interpret it as provider delivery.

## 5–6. Indexes, constraints, types

- UUID primary keys on profiles, watchlists, watchlist_items, alerts, notifications; slug primary key on ipos.
- `watchlists_user_position_idx(user_id,position)`.
- `watchlist_items_list_idx(watchlist_id)` and `watchlist_items_instrument_idx(instrument_key)`.
- UNIQUE `(watchlist_id,instrument_key)` on watchlist_items.
- `alerts_user_status_idx(user_id,status)`; partial `alerts_active_evaluation_idx(status,last_evaluated_at) WHERE status='active'`.
- `notifications_user_created_idx(user_id,created_at DESC)`.
- Partial UNIQUE `notifications_alert_event_unique(user_id,alert_id,event_id) WHERE event_id IS NOT NULL`. Dedupe is per owner's alert and source event, not globally across subscribers. Historical null IDs remain allowed.
- Cascading Auth/user and parent/child foreign keys are specified in migration 1. Alerts use text CHECK constraints for type/status/entity; watchlists have name/position constraints; stock exchange is NSE/BSE.
- No PostgreSQL ENUM or custom composite type is required. `jsonb` is used for metadata. `pgcrypto` is the only explicitly requested extension. Generated table row types are PostgreSQL built-ins.

## 7. Staging auth and Google OAuth

Use a stable staging Preview alias as staging **Site URL**, if one is available; otherwise use the specific current Preview origin and maintain it as deployments change. Never set staging Site URL to `www.credonomics.in`. The app supplies `window.location.origin + /auth/callback` with a validated relative `next`, so normal sign-in returns to the initiating deployment.

On **staging Supabase**, allow the actual Preview callback URL, including the query/path variants needed by `/auth/callback?next=...`. For repeated Preview builds, use a narrowly project/team-scoped pattern such as `https://credonomics-site-*-<team-slug>.vercel.app/**`; prefer exact origins when practical. Permit `http://localhost:3000/**` and `http://127.0.0.1:3000/**` only in staging/local configuration. Do not use `https://*.vercel.app/**` or open redirects. `/api/auth/callback` is a compatibility alias; add its exact URL only if using it. Site URL is the fallback; explicit redirectTo must match the allowlist. [Supabase redirect URL rules](https://supabase.com/docs/guides/auth/redirect-urls).

Google's authorized redirect URI is **`https://<staging-project-ref>.supabase.co/auth/v1/callback`**, not the Vercel callback. Enable Google in staging Supabase and enter its OAuth client ID/secret there. The browser return URL belongs in Supabase's allowlist. A dedicated staging Google Web application OAuth client is recommended to isolate credentials, consent testing and callback administration. Reusing the existing client can work by **adding** the staging Supabase callback while retaining every Production callback and using that client's credentials in staging. Never replace the Production redirect URI. If Google requests JavaScript origins, use the exact staging origin (no paths); this app uses the Supabase OAuth redirect flow, not the Google One Tap SDK. Configure consent-screen test users as required by the chosen Google client. [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

Verify first staging signup creates exactly one profile and default watchlist. Email confirmation settings/templates and SMTP are separate staging configuration if testing password signup; do not disable Production confirmation or alter Production templates.

## 8–9. Environment matrix and scopes

Never write real key values into this document. A project reference is an identifier, not a credential.

| Variable | Production scope | Preview scope | Development scope |
| --- | --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Existing Production URL | New staging URL | Staging or explicit local URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Production publishable key | Staging publishable key | Matching staging/local public key |
| SUPABASE_SERVICE_ROLE_KEY | Existing Production server secret | Staging server secret, entered directly in Vercel | Matching staging/local server secret, kept in ignored env file |
| SUPABASE_BACKEND_ENV | `production` (optional to preserve existing behavior) | `production` or unset while waiting; `staging` only after verified cutover | Explicit `staging`/`local` label for operator clarity |
| SUPABASE_STAGING_PROJECT_REF | Unset | Exact staging project reference | Optional documentation pin; Preview guard is keyed to VERCEL_ENV |
| CRON_SECRET | Existing Production secret | Separate staging-only secret before CRON QA | Separate local test value |
| VERCEL_ENV | Platform-managed production | Platform-managed preview | Platform/local value; do not fake production to bypass safety |

The guard checks a staging declaration plus an exact HTTPS `<ref>.supabase.co` hostname. It defaults locked on Preview when values are missing/invalid/mismatched. It does not validate key provenance or hosted schema remotely. Verify those during cutover. No service key, production project URL or server marker is sent to client bundles; the auth preflight exposes only a boolean. Public Supabase URL/publishable key remain intentionally public.

The local `.env.local` is **not** replaced by this batch. Do not run local write QA with its current values. Environment pulls can overwrite files; use a new ignored staging-specific file after configuration and review variable names/scopes without printing values. Keep Development off Production before allowing local mutation tests.

## 10. Seeding and reference data

No seed rows are required for signup, dashboard empty states or price alerts. Market instruments, IPO public pages and MF datasets use repository/provider data rather than personal database seeds. The IPO evaluator reads `public.ipos`; future staging reminder tests need explicit staging-only fixture rows or a verified reference import with actual nullable milestone dates. No automatic importer currently populates that table. Missing dates must remain NULL. Never convert fetch/build time into an announcement, ex-date, milestone or source observation date.

## Guard scope and remaining boundaries

Middleware blocks Preview cloud alert/watchlist/notification writes, manual cloud evaluation, CRON GET evaluation and auth callbacks while locked. Server SDK transports also reject mutations and any REST RPC invocation; both evaluator entry points assert the guard before DB access. Browser auth initiation and SDK mutations use a no-store server permission check. Device-local watchlists/price-alert evaluation and read-only pages remain available. No synthetic seed/test cleanup HTTP endpoints or production DB migration commands are introduced.

This is accidental-QA protection, **not a replacement for RLS or separate credentials**. A user calling Supabase directly with their own credentials is outside the application guard and remains governed by RLS. Arbitrary SQL scripts, Supabase dashboards, third-party admin tools and old deployments are also outside this guard. Historical `artifacts/` scripts may contain old endpoints/session fixtures; they are ignored by Git/deploy upload and must not be reused for mutation QA. Recreate staging-only scripts with explicit target checks after cutover. Production-only read checks in `scripts/site/check-live-production.mjs` are clearly named and read-only; do not use them as staging checks.

## Gate still required after cutover

Actual two-user RLS isolation, hosted migration/policy/grant verification, Google login, notification persistence, concurrent CRON races, full cloud alert lifecycle/IPO UI, personalized dashboard and real provider-trigger QA remain pending. SQL locking/unique constraints have isolated coverage, but embedded single-connection PostgreSQL is not proof of hosted concurrent operation. Complete those checks before marking full Preview QA passed or starting Mutual Fund Intelligence V2.
