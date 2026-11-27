# Research Watch release note — Bajaj Finserv Business Cycle Fund NFO

## Editorial decision

Add one source-checked guide for Bajaj Finserv Mutual Fund's new open-ended business-cycle thematic equity scheme. The NFO runs from 20 November through 4 December 2026. This is a new scheme, not a change to an existing fund portfolio or a recommendation to invest.

## Dates kept distinct

- SID date: 1 October 2026.
- NSE platform circular date: 19 November 2026 (NMF77503).
- NFO opening: 20 November 2026.
- NFO closing: 4 December 2026.
- Checked: 27 November 2026.
- NSE MF Invest tentative allotment date: 11 December 2026.
- NSE MF Invest cleared-funds deadline: 10 December 2026 at 3:00 pm (platform-specific).
- Separate AMC public-announcement date: not established in the reviewed documents.
- Fixed calendar date for continuous-scheme reopening: not stated; SID says within five business days of allotment.

## Primary sources

- AMFI-hosted issuer Scheme Information Document (SID), dated 1 October 2026: https://portal.amfiindia.com/spages/14599.pdf
- NSE circular NMF77503, dated 19 November 2026: https://nsearchives.nseindia.com/content/circulars/NMF77503.pdf
- Bajaj Asset Management SID disclosure page for later addenda: https://www.bajajamc.com/sid-disclosure

The Bajaj AMC disclosure page returned HTTP 403 to the research checker on 27 November 2026. The guide therefore relies on the current SID and NSE circular above and explicitly tells readers to check for any later addendum.

## Verified details retained

- Open-ended, actively managed thematic equity scheme focused on business cycles; no assurance that the investment objective will be achieved.
- NFO window 20 November–4 December 2026; ₹10 per unit during the NFO.
- Minimum lump-sum application ₹500, with multiples of ₹1 thereafter; SIP minimum ₹500 with at least six instalments.
- Benchmark: BSE 500 Total Return Index (TRI); the scheme is not an index-tracking fund.
- Indicative allocation: 80–100% in equity/equity-related instruments of companies selected on a business-cycle basis; 0–20% in other equity; 0–20% in money-market/liquid instruments and specified units.
- NFO-stage riskometer: Very High for scheme and benchmark; the SID says the label may change after actual investments are made.
- Exit load: 1% of applicable NAV for redemption/switch-out within three months of allotment; nil thereafter, subject to the SID's specific switch and regulatory exceptions.
- Fund managers named in the SID: Sorbh Gupta and Bharat Hegde (equity); Siddharth Chaudhary (debt).
- NSE MF Invest circular: platform window to 11:59 pm on 4 December, tentative allotment 11 December, and cleared-funds deadline 10 December at 3:00 pm. These are platform-specific operational details, not universal channel cut-offs.

## Explicitly not claimed

- No guaranteed or forecast return, performance history, or suitability conclusion.
- No claim that ₹10 per unit means the scheme is cheap or undervalued.
- No universal 4 December cut-off time for every distributor or application channel.
- No fixed reopening date beyond the SID's within-five-business-days wording.
- No actual current TER inferred from regulatory expense ceilings.
- No ranking, reward valuation, card data or fund portfolio formula change.

## Repository release controls

- Repository: aqdas1820/credonomics-site.
- Exact pre-edit main SHA: 3ca889bd3788efbf67534355a1fa793142f673ee.
- Rollback branch: backup/pre-bajaj-business-cycle-20261127-0915 (created from that exact SHA).
- Feature branch: research-watch-bajaj-business-cycle-nfo-20261127-0915.
- Content file: app/data/research-watch.ts.
- Evidence file: docs/RESEARCH_WATCH_BAJAJ_BUSINESS_CYCLE_NFO_20261127.md.
- The shared ResearchWatchBrief data path feeds the homepage, Research Watch hub, November bulletin and Mutual Funds landing page. The existing search-index generator and sitemap both consume the same data. No separate scheme-detail route exists in the current site structure.
- Navigation already links to Research Watch and the November bulletin.
- No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, automation schedules, card ranking formulas or reward valuations are changed. No external messages/comments are sent.

## Validation and production evidence

- PR: pending.
- Preview deployment: pending.
- Unit tests: pending.
- TypeScript: pending.
- Search-index generation: pending.
- Production build: pending.
- Production deployment ID/state/commit: pending.
- Public article, homepage, Research Watch hub, November bulletin, Mutual Funds landing page, search and sitemap verification: pending.

## Public baseline before this release

The latest production deployment was READY for main SHA 3ca889bd3788efbf67534355a1fa793142f673ee. The homepage showed the 27 November Axis NFO card, and its direct article was reachable through the homepage link. The Research Watch hub and November bulletin still displayed a 26 November snapshot; public search and sitemap had returned Internal Error in the preceding review. These surfaces must be checked again after this release. No cache purge, DNS edit, alias reassignment, routing change or infrastructure modification is authorised or attempted.
