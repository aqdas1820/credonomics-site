# Research Watch release note — Axis Nifty LargeMidcap 250 Index Fund NFO

## Editorial decision

Add one source-checked guide for Axis Mutual Fund's new open-ended Nifty LargeMidcap 250 index fund. The NFO opens on 27 November 2026 and closes on 11 December 2026. This is a new scheme, not an update to an existing fund portfolio record. The guide is factual product information, not an investment recommendation.

## Dates

- Checked: 27 November 2026.
- Repository publication date: 27 November 2026; public rendering remains unconfirmed.
- NFO window: 27 November–11 December 2026.
- Separate public announcement date: not stated on the reviewed Axis AMC NFO page.
- NFO closing cut-off time: not stated on the reviewed page; readers are directed to check the issuer's current cut-off.

## Primary sources

- Axis Mutual Fund NFO page: https://www.axismf.com/nfo/axis-nifty-largemidcap-250-index-fund/np-dg
- NSE Indices — Nifty LargeMidcap 250: https://www.niftyindices.com/indices/equity/broad-based-indices/nifty-largemidcap-250

## Verified points retained

- ₹100 minimum application and multiples of ₹1 thereafter.
- Open-ended index mutual fund tracking the Nifty LargeMidcap 250 TRI before expenses, subject to tracking error; no assurance the objective will be achieved.
- Underlying index combines 100 Nifty 100 constituents and 150 Nifty Midcap 150 constituents.
- Aggregate large-cap and mid-cap segment weights are 50% each, reset quarterly; the index is reconstituted semi-annually.
- The 50:50 rule is at segment level, not equal weighting of all 250 stocks; individual constituents are weighted by free-float market capitalisation.
- Very High risk label at NFO; the AMC says the riskometer may change after actual investments are made.
- AMC page lists 0.25% exit load for redemption/switch-out within 15 days from allotment and nil thereafter.
- This is an index mutual fund, not an ETF; the AMC FAQ says a demat account is not required.
- Actual scheme returns can differ from index returns due to expenses, cash holdings and tracking error.

## Explicitly not claimed

- No actual TER or all-in cost figure.
- No unverified digital/physical SIP commencement date or multiple-SIP restriction.
- No fixed calendar date for reopening continuous purchase/redemption after the NFO.
- No benchmark-history figure presented as scheme performance.
- No card ranking, mutual-fund portfolio record, or investment formula change.

## Content release controls

- Repository: aqdas1820/credonomics-site.
- Exact pre-content-edit main SHA: a8a43670ccf0c4531fb2b086f0b4cdb5a09b006c.
- Original rollback branch: backup/pre-axis-largemidcap-nfo-20261127-0819 (verified at the exact pre-edit SHA).
- Original feature branch: research-watch-axis-largemidcap-nfo-20261127-0819.
- Content PR #198 merged as commit: cab73382c6c519e08c88fd7c39e174140d48a970.
- Content preview deployment: dpl_BQjcKjdRjHGdHQJL7uZ5PocKDfTZ — READY for commit fde1490c32ceead7011c5669d30aec731ff904b2.
- Content production deployment: dpl_AjBCuzVrf8u6fKdSCrMrm9krKn1n — READY, target production, deployed commit cab73382c6c519e08c88fd7c39e174140d48a970.
- Vercel production aliases credonomics.in and www.credonomics.in are assigned to that deployment.

## Validation and public-rendering limitation

The corrected content PR preview passed 177/177 unit tests across 29 files, TypeScript, the IPO/search generators and the Next.js production build. The generated route manifest included /research/watch/axis-nifty-largemidcap-250-index-fund-nfo-december-2026 and /sitemap.xml.

The first production build generated 154 search entries, but inspection of the existing generator (scripts/generate-search-index.mjs) showed it parses unquoted TypeScript property names such as slug:. The initial JSON-quoted item keys therefore did not make the new article discoverable in the generated search index. Follow-up correction branch research-watch-axis-search-index-fix-20261127-0845 reserializes the record with unquoted property names so the existing generator can index it. Its exact pre-fix main SHA is cab73382c6c519e08c88fd7c39e174140d48a970; rollback branch backup/pre-axis-search-index-fix-20261127-0845 preserves that exact SHA.

Public checks on 27 November returned:
- Research Watch hub, homepage and November bulletin still displayed the 26 November snapshot.
- Direct article route returned Internal Error.
- Public search and sitemap returned Internal Error.

Thus production deployment READY and alias assignment are confirmed, but public visibility is not. No cache purge, DNS, alias, routing or infrastructure change was attempted. The article must not be described as publicly live until the public route, hub, homepage, bulletin, search and sitemap reflect the current data.

## Scope safeguards

Only the data-driven Research Watch record and this evidence note are changed. Existing homepage, Research Watch, November bulletin and mutual-fund landing page consume the shared data; the sitemap imports the same data and the search-index generator consumes it through its existing parser. No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, ranking formulas or automation schedules are changed. No external messages/comments are sent.
