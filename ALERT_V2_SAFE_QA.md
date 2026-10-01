# Alert Engine V2 safe QA and ownership audit

## Hosted staging checkpoint - 2026-09-30

This section supersedes the preparation-only scope below. Full Alert Engine V2 QA remains **NOT PASSED**.

- COMPLETED: fresh release gate passed (typecheck, lint, 277 tests / 28 files, build). Existing hardening preserved.
- COMPLETED: verified `credonomics-staging` = `jvpiulmcjjnsgozgqgzw`, distinct from previous Production link `tpllgtskvvkronmbxkmg`; linked checkout to staging. Empty-database preflight: zero public tables, zero Auth users, no migration history.
- COMPLETED: applied all four repository migrations via CLI with explicit staging ref, no seeds/vault updates. Hosted catalog evidence is in `artifacts/staging-schema-verification.json`; query is `scripts/site/verify-staging-schema.sql`.
- COMPLETED: hosted RLS enabled on profiles, watchlists, watchlist_items, alerts, notifications, ipos. Actual USING/WITH CHECK predicates match the ownership matrix below: conceptual A cannot read/update/delete B or insert/reparent rows as B. Notifications have no user INSERT/DELETE policy and UPDATE only permits read_at. IPOs are public reference data with user SELECT only. All seven policies inspected; no additional permissive policies were present.
- COMPLETED: fourteen indexes, twenty constraints (including item uniqueness and alert type/status/entity checks), three functions and enabled signup trigger inspected. Hardened V2 function contains row lock, event conflict suppression, cooldown checks and atomic notification/alert updates. Client execution denied for privileged functions; alert RPC service-role execution allowed. No custom enum is required.
- IN PROGRESS: configuration handoff for Vercel Preview and staging Google OAuth.
- BLOCKED: actual signup execution, A/B session tests, concurrent dedupe/cooldown, rollback fault injection, notification read lifecycle, IPO/dividend/CRON and full browser QA await confirmed Preview-to-staging cutover. Catalog/source checks do not establish runtime passes. Existing alert edit/disabled controls and IPO create/follow functional gaps remain unresolved.
- WAITING FOR USER: confirm Preview-only environment values and staging OAuth saved. Vercel connector currently reports 403 for this team; reconnect before using it for deployment.
- NEXT PRIORITY: fresh hardened Preview deployment after confirmation, server-side backend identity verification, then staging-only QA users and full alert tests. Production unchanged; no Stripe or Mutual Fund Intelligence V2 work.

No QA users, test fixtures, personal rows or production data were created/copied. Hosted auth.users and all six application tables are still empty. Saved research, generic followed entities and personal MF portfolios have no migrations/tables and are not claimed as tested. The matrix below now matches installed staging catalog definitions; executed two-user/browser verification remains pending.

2026-09-30. Scope: repository source, mocked services and an in-memory PostgreSQL instance only. No remote database reads/writes, QA accounts, real user modifications, hosted migrations or two-user write-based isolation tests were performed. Full Preview QA is still **not passed**.

## Ownership matrix

“Denied” below describes the repository policy/query contract, not a claim that the current hosted database has those migrations installed. A/B are conceptual principals, not created users.

| Resource | A reads B | A inserts as B | A updates B | A deletes B | Server boundary / findings |
| --- | --- | --- | --- | --- | --- |
| profiles | Denied | Denied | Denied | Denied | `profiles_own`: ID equals auth.uid in USING and WITH CHECK. No profile-write API/client table query found. Signup trigger takes new Auth user's ID. |
| watchlists | Denied | Denied | Denied | Denied | `watchlists_own`; API derives owner from verified session. Added explicit owner filter to list GET, complementing RLS. Mutation endpoints already scope by owner. |
| watchlist_items | Denied | Denied through parent ownership | Denied, including reparenting to B | Denied | Parent existence/ownership in USING and WITH CHECK. Item routes verify parent ownership before upsert/delete; no direct user_id input is trusted. |
| alerts | Denied | Denied | Denied, including owner reassignment | Denied | `alerts_own`; session owner is inserted, PATCH/DELETE filter ID and owner. Evaluator user scope is server-derived; CRON global scope requires secret. |
| notifications | Denied | No authenticated INSERT policy | Denied | No authenticated DELETE policy | Changed routes from admin to session client. All queries still filter user_id. New migration restricts UPDATE privilege to read_at; users previously could rewrite their own content/alert FK, though not another user's notification row. |
| IPO reference records | Public non-personal read | Service-role only | Service-role only | Service-role only | New missing `ipos` table has public SELECT RLS and no user write policy. Not a follow/subscription table. |
| saved research | Not implemented as user-owned DB resource | N/A | N/A | N/A | No table, policy, API, server action or client query found. |
| generic tracked entities / followed IPOs | Not implemented as user-owned DB resources | N/A | N/A | N/A | Stock tracking uses watchlists/items. Existing IPO evaluator supports rows marked IPO, but public creation flow does not yet support them. |
| mutual-fund tracking | No personal DB persistence found | N/A | N/A | N/A | Public holdings/datasets/provider route, not user-owned portfolios. Do not claim cross-user fund-isolation verification. |
| device watchlists / alerts / recent views | Shared browser-origin state | N/A | N/A | N/A | Explicit device scope, not account-private storage. No cloud-isolation claim; use separate browser contexts for account QA. Recent views remain browser-local. |

## Service-role and authorization findings

- `src/lib/supabase/admin.ts` is server-only; now uses guarded transport. Remaining consumers are V2 and legacy cloud evaluators. Normal notifications/dashboard routes now use the verified session client and RLS.
- Dashboard previously executed an unused, unscoped service-role SELECT of all watchlist_items before its scoped queries. Removed it. It was an unnecessary privileged read; no evidence it was returned to the browser.
- Dashboard now checks both parent/item query errors; database failures no longer masquerade as successful empty calendars. Event data is normalized/deduplicated and links retain NSE/BSE identity.
- `/api/alerts/evaluate?scope=cloud` uses `authenticatedUser()` and ignores caller-supplied owner IDs. CRON GET requires the exact configured bearer secret and fails when configuration is missing. Existing rate limits and same-origin mutation middleware remain.
- `trigger_price_alert` and `trigger_alert_v2` are SECURITY DEFINER with empty search_path and explicit execute grants only to service_role. The signup trigger is also restricted in the additive migration. Direct client RPC access is not permitted by repository grants.
- No `use server` action or browser `.from()`/`.rpc()` user-data bypass was found. Browser SDK use is Auth/session handling. The Preview guard covers browser auth writes because signup can create profile/watchlist rows.
- Supabase RLS remains the direct-API ownership boundary; application safety flags cannot constrain arbitrary external SQL tools. [Supabase RLS and service-role behavior](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Reproduced/fixed isolated regressions

| Area | Finding and local correction |
| --- | --- |
| Price evaluation | JavaScript coercion/Infinity could satisfy comparisons for malformed prices; finite positive prices and valid condition operands now required. Stale/unavailable/unknown metadata and explicit isStale reject triggering. |
| Corporate actions | Loose description keyword matching could misclassify events; exact supported event types and valid source dates now required. Identity is instrument/type/source ex-date; ordering and duplicate-provider input are deterministic. Missing dates remain missing. |
| IPO reminders | UTC date boundary was wrong for Indian midnight; milestone date comparison and price daily keys now use IST with an injected evaluation clock. IPO query and RPC errors are no longer ignored. |
| Cooldown | Evaluation captures one clock and validates cooldown before provider fetch. DB rechecks atomically with the authoritative DB clock. Invalid client-side cooldown values fail closed. |
| Dedupe | Old RPC stored event_id without enforcing it. Additive migration uses unique owner/alert/event identity plus row lock, and does not increment trigger_count when duplicate insert is suppressed. Dedupe survives rearm/cooldown expiry. |
| Persistence | RPC errors now fail evaluation rather than reporting success; only boolean true claims count as triggers. SQL notification failure rolls back alert transition/count. |
| Notification UI | Previously marked local read state after any HTTP status. Now waits for successful persistence and reloads stored timestamps/count; error states remain visible. Unread count comes from all user notifications, not only latest 50. |
| Navigation/layout | Notification links resolve stock exchange or IPO identity; dashboard links no longer assume NSE. Calendar grid can shrink below 300px. No full authenticated browser pass is claimed. |
| Provider failures | Device evaluator returns no-store 502 for malformed data/throws; isolated tests cover HTTP/network failures and do not manufacture triggers. |
| Preview safety | Unknown/Production backend is write-locked until server-only staging declaration and exact project reference match. See staging document for scope and limitations. |

Corporate events currently use ex-date identity; distinct same-type actions for one instrument on the same date are conservatively coalesced because provider records lack a reliable unique event ID. Earnings are evaluated only if explicitly typed and dated; descriptions are not interpreted as confirmed earnings announcements. A future earnings provider contract may need a dedicated report-date field. These limits avoid false events.

## Coverage and evidence

- `alert-v2-safety.test.ts`: price boundaries/equality, malformed/missing/stale/unavailable prices, event identities/dates, duplicate input, cooldown, per-user evaluator scope, repeated CRON with a persistence double, IPO milestones, corporate types, provider failures and database rejection.
- `preview-mutation-safety.test.ts`: Preview default-deny, staging URL pin, unchanged Production branch, middleware route coverage, direct SDK write/RPC guards, auth preflight and retained read/device functionality.
- `notification-confirmation.test.ts`: unsuccessful persistence cannot update read state; successful reload supplies stored data; malformed/network failures; entity links.
- `alert-api-authorization.test.ts`: session/CRON checks, caller owner spoofing rejection, safe malformed provider handling, signed-out notifications/dashboard.
- `personalization-ownership.test.ts`: session-scoped notification reads/count/updates, ignored caller ownership fields, owned-parent dashboard queries, BSE navigation identity, duplicate/missing events and database failure states; no live data or writes.
- `staging-migrations.test.ts`: entire SQL chain on clean embedded PostgreSQL, additive migration replay, RLS enabled, no seed dependencies, privilege checks, single synthetic signup, atomic dedupe/cooldown and rollback. This is not hosted two-user isolation or a multi-connection race test.
- Existing provider transport tests retain mocked timeout, retry, 429 Retry-After, 500/502/503 coverage. No test requires `.env.local`, a Supabase URL/key or network database access.

## Environment isolation review

Runtime Supabase clients read environment variables; no hardcoded hosted project URL/key was found in application code. Auth redirects use the request/browser origin and safe relative next path. Production canonical SEO/host redirects remain unchanged intentionally. Test URLs are non-production fixture identifiers. Public provider/document URLs in market datasets are not Supabase database destinations.

Historical handoffs/artifacts contain old Preview origins. Artifacts are excluded from deployment, but excluded scripts are not intrinsically safe: do not reuse historical session/SQL helpers for staging. `scripts/site/check-live-production.mjs` explicitly GETs Production pages; it is not a staging check and does not write. No active seed/reset/push helper is added. `.env.local`, Vercel scopes and Supabase dashboard settings were not changed; future cutover must replace Preview/Development credentials explicitly. Old deployed Previews do not inherit newly implemented safety code.

## Remaining gate

Only staging-dependent validation remains blocked: actual project configuration, hosted schema/grants/Auth, two-user RLS, real cloud persistence/trigger/CRON concurrency, and authenticated Preview flows. Full functional QA also needs follow-up on existing edit/disabled controls and IPO create/follow flow; this safe batch does not invent those features or mark them passed. Mutual Fund Intelligence V2 remains unstarted.
