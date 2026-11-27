# Research Watch release record — Baroda BNP Paribas Balanced Hybrid Fund NFO

## Editorial decision

Add one independently verified guide for the Baroda BNP Paribas Balanced Hybrid Fund NFO, which opened on 25 November 2026 and is scheduled to close on 8 December 2026. This scheme was not present in the current Research Watch dataset, homepage feed, November bulletin or the existing NFO coverage inspected on 27 November.

The guide is a factual product summary, not an investment recommendation. It does not use the AMC's promotional return illustrations as a forecast and does not alter any fund ranking, card score, reward valuation or portfolio formula.

## Dates kept distinct

- KIM document date: 23 October 2026.
- SID document date: 26 October 2026.
- NFO opening: 25 November 2026.
- Independent check: 27 November 2026.
- NFO closing: 8 December 2026.
- Continuous sale and repurchase scheduled to reopen: 21 December 2026.
- A separate announcement date is not asserted.

## Primary sources — full official URLs

1. Baroda BNP Paribas Mutual Fund NFO page:
   https://www.barodabnpparibasmf.in/balanced-hybrid-fund-nfo/

2. Official Key Information Memorandum, dated 23 October 2026:
   https://www.barodabnpparibasmf.in/balanced-hybrid-fund-nfo/pdf/balanced-hybrid-fund-kim.pdf

3. Official Scheme Information Document, dated 26 October 2026:
   https://www.barodabnpparibasmf.in/balanced-hybrid-fund-nfo/pdf/balanced-hybrid-fund-sid.pdf

The AMC's NFO page and both scheme documents were independently checked. The official NFO page, KIM and SID agree on the 25 November–8 December offer period and 21 December reopening date.

## Verified details retained

- Scheme: Baroda BNP Paribas Balanced Hybrid Fund, an open-ended balanced scheme investing in equity and debt instruments.
- NFO price: ₹10 per unit.
- Minimum lump-sum application: ₹1,000 in multiples of ₹1.
- KIM-listed SIP minimums: ₹500 for daily, weekly and monthly frequencies; ₹1,500 quarterly. Platform acceptance and registration timing must still be checked.
- Normal asset allocation: 40–60% equity and equity-related instruments; 40–60% debt and money-market instruments.
- No arbitrage is permitted. The SID nevertheless permits equity derivatives up to 50% of equity assets for SEBI-permitted purposes, including hedging and portfolio balancing. The guide does not incorrectly describe the scheme as derivative-free.
- Benchmark: NIFTY 50 Hybrid Composite Debt 50:50 Index.
- NFO-stage riskometer: High Risk for both scheme and benchmark. The KIM says the scheme riskometer is based on internal assessment and may change after actual investments are made.
- The KIM states that the new scheme has no performance track record and that the objective is not guaranteed.
- Exit load: 1% of applicable NAV on redemption/switch-out above 10% of units allotted within one year; up to 10% within that year is nil-load; after one year nil. The schedule also applies to switches between the Fund's schemes and SIP/STP/SWP transactions, with the specific plan/option and unit exceptions disclosed in the KIM.

## Consumer action and limitations

- Readers should verify the current NFO cut-off and payment instructions on the AMC page and their chosen platform.
- The NFO price is not a valuation signal.
- The NFO-stage riskometer is not a return forecast and may change after actual holdings are established.
- No return projection, suitability recommendation, tax conclusion or guarantee is published.
- No existing scheme ranking, portfolio score or investment formula is changed.

## Website integration

The new item is added to `app/data/research-watch.ts`. Existing shared components make it eligible for:
- Homepage Research Watch feed.
- Research Watch hub and data-driven article route.
- November 2026 monthly bulletin.
- Mutual Fund Intelligence page's mutual-fund Research Watch section.
- Search index generated from Research Watch data.
- Sitemap article entries generated from Research Watch data.

No manual search-index or sitemap edit is required; the production prebuild regenerates the search index and the sitemap derives article routes from the same data array.

## Git and release controls

- Repository: `aqdas1820/credonomics-site`.
- Exact base `main` SHA: `ac432f5afc7a45850e131f4cc5383c7d62455280`.
- Rollback reference created from that exact SHA: `backup/pre-baroda-balanced-hybrid-nfo-20261127-1331`.
- Feature branch: `research-watch-baroda-balanced-hybrid-nfo-20261127-1331`.
- Content file: `app/data/research-watch.ts`.
- Release evidence is to be appended after PR review, merge, production deployment and public-route verification.

## Validation and publication evidence

- Unit tests, TypeScript and production build: pending preview/build workflow.
- PR number and intended head SHA: pending.
- Merge commit and production deployment ID: pending.
- Public article, Research Watch hub, homepage, November bulletin, Mutual Fund Intelligence page, search entry and sitemap verification: pending.
- Any failed or stale public route will be reported as unconfirmed; production READY alone will not be described as proof that content is publicly visible.
