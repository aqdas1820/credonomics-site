CREDONOMICS V14.2 — AUTOMATIC IPO MARKET MASTER
================================================

WHY V14.1 CURRENT IPOs COULD BE EMPTY
V14.1 rendered Current/Upcoming/Mainboard/SME from verified-ipos.generated.ts.
That file intentionally contained only manually/structurally normalized offer-document
research. Therefore exchange-live issues were invisible until financial normalization.

V14.2 SPLITS THE DATA PIPELINE:

1. EXCHANGE MARKET MASTER
   Inputs:
   - NSE public-issue page
   - best-effort official NSE current-issue JSON endpoint used by the public page
   - official BSE public-issue pages as supplemental/fallback sources

   Can publish immediately:
   - company name
   - NSE symbol where available
   - Mainboard / SME
   - open / upcoming / recently closed status
   - issue open / close dates
   - price band where exposed
   - total subscription where exposed
   - shares offered / bid where exposed
   - estimated issue value where it can be mechanically derived
   - official exchange source

2. SEBI DOCUMENT DISCOVERY
   DRHP / RHP / prospectus / addendum / corrigendum research queue.

3. NORMALIZED FINANCIAL RESEARCH
   Source-backed financials, KPIs, valuation, issue structure, promoter information,
   risk flags and peer context.

4. DATA SCORE
   Only normalized financial research enters the 100-point quantitative Data Score.
   Exchange-live records show "LIVE / score pending" until sufficient normalized data exists.

PUBLIC EFFECT
- /ipo/current no longer depends on the financial research database.
- /ipo/upcoming no longer depends on the financial research database.
- /ipo/mainboard and /ipo/sme use the merged public master.
- /ipo/calendar uses exchange-backed dates.
- /ipo/subscription uses exchange-backed subscription where available.
- auto-only IPOs receive useful individual pages immediately.
- when no IPO is actually open, the page explains that and shows upcoming,
  recently closed and RHP/prospectus pipeline data instead of a dead blank screen.

IMPORTANT
NSE can restrict automated cloud requests. The refresh script:
- establishes an NSE browser-like session/cookies,
- tries the current-issue data endpoint,
- falls back to parsing the official public issue page,
- supplements from BSE where possible,
- preserves the last-known successful market master if fresh exchange access fails.

No third-party IPO portal is used as production data truth.

COMPLIANCE
Subscription and exchange demand remain outside the fundamental Data Score.
No GMP, Subscribe/Avoid/Buy call, price target or listing-gain forecast.

MF SAFETY
MF portfolio files/data/scripts and app/globals.css remain excluded.
