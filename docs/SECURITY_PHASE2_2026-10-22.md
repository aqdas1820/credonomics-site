# Security phase 2 (22 Oct 2026)
- Mutating cookie-authenticated APIs reject requests with **neither** Origin nor Sec-Fetch-Site, in addition to blocking cross-site calls.
- Bound JSON request body size for watchlists creation (other authenticated mutations were already bounded in PR #22).
- Validate NSE/BSE equity instrument keys before calling market provider for shareholding and corporate action routes.
- Add noindex/nofollow/nosnippet API response headers.
- Security regression unit tests added.

## Open issues
- Next.js 14.2.35 upgrade to patched, supported release (#23). No automatic major-version deploy without matching lockfile and React 19/route compatibility tests.
- Distributed rate limiting (existing per-process throttling can be bypassed by distributed sources).
- Live authenticated RLS/IDOR testing using staging credentials/identities.
- DAST and end-to-end real browser security regression tests.
- These changes do not touch payment operations, customer data, cron credentials or production auth configuration.
