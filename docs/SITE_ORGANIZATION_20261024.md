# Professional site organization — 24 October 2026

Base production release: `ff5081c24e77722cd47f1cabbd2c891c79ed2413`.

## Information architecture

`app/data/site-navigation.ts` is the shared registry for six primary sections (Markets, Research, IPOs, Mutual Funds, Cards, Tools), plus My Workspace and About & Trust. It powers the header, section navigation, searchable platform directory and grouped footer. Longest-prefix classification retains existing route boundaries: the portfolio tracker belongs to Mutual Funds, stocks belong to Markets, and Reports/Updates belong to Research.

- Header: section overview links and explicit accessible dropdown toggles. One dropdown opens at a time; Escape and outside-pointer dismissal clean up state. Mobile navigation uses the same registry in a collapsible menu. Search, theme, account, alerts and the mobile dock are retained.
- Section navigation: contextual links with one most-specific active destination; account/watchlist/alerts retain calm presentation. IPOs retain their existing issue-stage subnavigation.
- Explore: complete curated platform directory with task search, section filtering, result count, reset and recovery from no matches. Research content remains searchable through the existing full-search route.
- Footer: the same eight section groups, contact/legal/corrections links and platform-directory access. Removed the generic instagram.com placeholder, which did not identify an official account.
- Tools: four collections (research workspaces, real-card comparisons, custom models, focused calculators); removed repeated analyzer/registry blocks and blanket Live badges. Input/source context distinguishes custom assumptions from normalized issuer terms.
- Existing standalone calculators: unified SiteFrame with a working All tools breadcrumb, original metadata and trust panels retained. Duplicate page branding/footer blocks become contextual notes. Calculator formulas are unchanged.
- Semantic structure: remove nested main landmarks from affected public pages and account presentation. No account logic changes.
- Sitemap: include missing curated public destinations while keeping account/watchlist/alerts out of the added public list. Existing routes, metadata, tool trust information and financial data are preserved.

## Verification and release

143 unit tests passed, including route ownership, longest-prefix classification, supported destinations and precise active-link matching. Production build and runtime checks are recorded in the PR/release result. Existing unrelated lint warnings are not part of this change.

No financial formulas, source data, payment routes, authentication behavior, environment settings or paid services are changed. Preserve the base release with backup/pre-site-organization-20261024. Reverting this release commit restores the prior navigation and page organization without migrating or deleting user data.
