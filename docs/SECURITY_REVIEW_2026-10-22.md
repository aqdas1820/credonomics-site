# CredoNomics public website security review — 2026-10-22

## Scope
Repository: aqdas1820/credonomics-site. Only non-destructive inspection of public production endpoints and connected source code was performed. No credentials, payment records, Supabase user records or live mutations were accessed. Private Windows-hosted YouPI-PG is **outside scope**.

## Application-level mitigations in this PR
- OAuth callback: next= is restricted to local paths; no off-site redirect.
- Authenticated cookie mutations: same-origin and Fetch Metadata check in middleware.
- Public, provider-backed market-data routes: best-effort per-IP/per-isolate throttling. These limits are **not distributed**.
- Read actual request-body bytes for the alert evaluator and public batch-quote endpoints; untrusted Content-Length alone is not relied on.
- Limit stock-search query length and instrument-key format for fundamentals.
- Watchlist list queries explicitly filter by user_id as defense in depth alongside database RLS.
- Add CSP base-uri/object-src/frame-ancestors/form-action restrictions without changing script policy, so existing Next.js + OAuth integrations still load.
- Cap lifetime of in-memory rate-limit buckets.
- Add unit security tests.

## High-priority residual risks — NOT resolved by this patch
1. Next.js 14.2.35 is an unsupported/vulnerable major line for 2026 advisories, including the 14 October 2026 critical Next.js security update (patched in 15.5.28 / 16.4.1). Next.js's May 2026 security release explicitly says all 14.x affected and instructs upgrade to supported 15.x/16.x. Current Next.js app uses synchronous route params, so framework upgrade needs a dedicated migration, updated lockfile and complete route/browser regression testing; do NOT equate this patch with framework-level remediation.
2. In-memory IP limits are not shared across Vercel isolates/regions and are susceptible to distributed abuse and untrusted proxy spoofing if upstream fails to normalize remote-address headers. Evaluate Vercel Firewall/WAF shared rate rules or a durable limiting backend within approved cost constraints.
3. Full authenticated IDOR/RLS testing requires dedicated test identities and a nonproduction Supabase project. SQL policy code review found RLS enabled with per-user policies; deployed database policy state was not independently audited.
4. No dynamic fuzzing, intrusive exploit probes, credential scans against deployment values, DAST, pentest, OWASP ZAP or real-browser full UI tests were run.
5. CSP intentionally does not enforce script-src; a strict script nonce/hash policy must be evaluated separately because a no-tolerance rollout can break Next.js hydration and Supabase OAuth.

## Deployment gate
Verify the branch Vercel preview builds and sample GET routes render, CI checks pass, then merge. Browser tests are included but should not be described as executed unless separately run.
