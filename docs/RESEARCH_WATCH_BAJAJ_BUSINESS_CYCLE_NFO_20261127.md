# Research Watch release note — Bajaj Finserv Business Cycle Fund NFO

## Editorial decision

Add one source-checked guide for Bajaj Finserv Mutual Fund's new open-ended business-cycle thematic equity scheme. The NFO runs from 20 November through 4 December 2026. This is a new scheme, not a change to an existing fund portfolio or a recommendation to invest.

## Dates kept distinct

- SID date: 1 October 2026.
- NSE platform circular date: 19 November 2026 (NMF77503).
- NFO opening: 20 November 2026.
- NFO closing: 4 December 2026.
- Checked: 27 November 2026.
- NSE MF Invest allotment date listed in circular NMF77503: 11 December 2026.
- NSE MF Invest member-to-clearing-corporation cleared-funds deadline: 10 December 2026 at 3:00 pm (platform-specific; not a retail investor application extension).
- SID payment instructions: electronic payments including RTGS/NEFT and cheque/transfer instructions are listed through 4 December 2026; this is distinct from the NSE clearing deadline.
- Separate AMC public-announcement date: not established in the reviewed documents.
- Fixed calendar date for continuous-scheme reopening: not stated; SID says within five business days of allotment.

## Primary sources

- AMFI-hosted issuer Scheme Information Document (SID), dated 1 October 2026: https://portal.amfiindia.com/spages/14599.pdf
- NSE circular NMF77503, dated 19 November 2026: https://nsearchives.nseindia.com/content/circulars/NMF77503.pdf
- Bajaj Asset Management SID disclosure page for later addenda: https://www.bajajamc.com/sid-disclosure

The Bajaj AMC disclosure page returned HTTP 403 to the research checker on 27 November 2026. The guide therefore relies on the current SID and NSE circular above and explicitly tells readers to check for any later addendum.

## Verified details retained

- Open-ended, actively managed thematic equity scheme focused on business cycles; no assurance that the investment objective will be achieved.
- NFO window 20 November–4 December 2026; ₹10 per unit during the NFO. The ₹10 offer price is not a valuation signal.
- Minimum lump-sum application ₹500, with multiples of ₹1 thereafter; SIP minimum ₹500 with at least six instalments.
- Benchmark: BSE 500 Total Return Index (TRI); the scheme is not an index-tracking fund.
- Indicative allocation: 80–100% in equity/equity-related instruments of companies selected on a business-cycle basis; 0–20% in other equity; 0–20% in money-market/liquid instruments and specified units. The SID permits concentrated exposure to the theme and says the scheme may be absent from some sectors at times.
- NFO-stage riskometer: Very High for scheme and benchmark; the SID says the label may change after actual investments are made.
- The SID says the scheme is not listed on a stock exchange at launch, although the AMC may choose to list it later.
- The SID expressly states that the units have not been approved or recommended by SEBI and that SEBI has not certified the SID's accuracy or adequacy.
- Exit load: 1% of applicable NAV for redemption/switch-out within three months of allotment; nil thereafter. The SID excludes switches to another equity scheme of the same AMC, Direct/Regular plan switches, option changes within the same plan, bonus units and IDCW reinvestment units. It also lists SEBI portfolio-rebalancing and qualifying over-25%-holding compliance exceptions.
- Fund managers named in the SID: Sorbh Gupta (Head–Equity and Fund Manager) and Bharat Hegde (Associate Fund Manager) for equity; Siddharth Chaudhary for fixed income.
- NSE MF Invest circular: platform window to 11:59 pm on 4 December; allotment date listed as 11 December; member-to-clearing-corporation funds deadline 10 December at 3:00 pm. These are platform-specific operating details, not an extension of the retail investor application deadline.
- The SID says electronic payments including RTGS/NEFT and cheque/transfer instructions are accepted through 4 December. This is separate from the NSE member settlement deadline.

## Explicitly not claimed

- No guaranteed or forecast return, performance history, or suitability conclusion.
- No claim that ₹10 per unit means the scheme is cheap or undervalued.
- No universal 4 December cut-off time for every distributor or application channel.
- The 10 December NSE clearing deadline is not a retail investor application extension.
- No fixed reopening date beyond the SID's within-five-business-days wording.
- No actual current TER inferred from regulatory expense ceilings.
- No claim of SEBI approval, recommendation or certification.
- No ranking, reward valuation, card data or fund portfolio formula change.

## Source locations

- SID pages 1–2: scheme identity, NFO dates and NFO-stage riskometer.
- SID page 5: benchmark and listing status.
- SID page 8: NFO unit price and payment-instruction date.
- SID page 17: minimum application and SIP terms.
- SID pages 26–27: asset allocation and permitted exposures.
- SID pages 34–35: fund managers.
- SID page 43: exit load and transaction exceptions.
- NSE circular NMF77503, page 1: NSE MF Invest window, allotment date and member-to-clearing-corporation funds deadline.

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

- PR #201: open; reviewed intended head pending final preview verification.
- Feature branch preview for the data commit: READY, but a later correction commit supersedes it.
- Final feature branch preview: pending final validation.
- Unit tests: pending final head confirmation.
- TypeScript: pending final head confirmation.
- Search-index generation: pending final head confirmation.
- Production build: pending final head confirmation.
- Production deployment ID/state/commit: pending.
- Public article, homepage, Research Watch hub, November bulletin, Mutual Funds landing page, search and sitemap verification: pending.

## Public baseline before this release

The latest production deployment was READY for main SHA 3ca889bd3788efbf67534355a1fa793142f673ee. The homepage showed the 27 November Axis NFO card, and its direct article was reachable through the homepage link. The Research Watch hub and November bulletin still displayed a 26 November snapshot; public search and sitemap had returned Internal Error in the preceding review. These surfaces must be checked again after this release. No cache purge, DNS edit, alias reassignment, routing change or infrastructure modification is authorised or attempted.
