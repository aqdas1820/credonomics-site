# Research Watch correction — Roarbank EMI foreclosure fee — 19 November 2026

## Published correction

- Updated existing guide: https://www.credonomics.in/research/watch/roarbank-emi-foreclosure-fee-november-2026
- Original publication date: 16 November 2026.
- Latest verification date: 19 November 2026.
- Effective date stated by the issuer: 21 November 2026.
- Separate announcement date: not stated.
- Affected audience: Unity Small Finance Bank Roarbank credit-card holders considering early closure of a Standard EMI or Partner EMI plan.
- The September 2026 Key Fact Statement lists the earlier 2% fee and a separate 3% row effective 21 November for both Standard EMI and Partner EMI. The fee is based on remaining principal; applicable GST is additional.
- The MITC independently states the same 21 November change for both plan types and says partial prepayments are not permitted.
- The live tariff overview, checked 19 November, now displays 3% of outstanding EMI principal. It does not itself state an effective date; the dated KFS and MITC rows provide that date.
- The issuer documents do not specify a cutoff hour or whether a request lodged before 21 November but processed later is assessed by request date or processing date. The guide tells holders to obtain a full quote and ask the bank which date controls; it does not infer a transition rule.

## Exact primary sources

1. Unity Small Finance Bank, Roarbank credit card Key Fact Statement (September 2026 edition), page 3, Standard EMI and Partner EMI foreclosure-fee rows:  
   https://roar.unity.bank.in/doc/Key%20Fact%20Sheet%20Roarbank.pdf
2. Unity Small Finance Bank, Roarbank credit card MITC, Standard EMI Early Closure and Partner EMI Foreclosure clauses:  
   https://roar.unity.bank.in/doc/MITC%20Credit%20card.pdf
3. Unity Small Finance Bank, current Roarbank tariff overview (3% displayed at the 19 November check; no separate effective date on the page):  
   https://roar.unity.bank.in/en/tariffs

## Research and deduplication

- This is a correction to the existing 16 November guide, not a duplicate article.
- The original 24 October batch was re-read from current repository data and checked against current official material:
  - IDFC FIRST IndiGo: the 13 September issuer communication and current IndiGo card page confirm zero forex markup and the card-specific international BluChip rate.
  - American Express: the current official Consumer Experience Updates page and 15 November credit-card MITC were checked. The official page's search result was readable, while direct page retrieval returned HTTP 400. Existing product-specific caveats remain; no refund eligibility, process or timeline is inferred.
  - HDFC Balanced Advantage Fund and HDFC Children's Fund: official Notice-cum-Addendum 1370 confirms the 9 November effective date, the 6 November exit-window close, optional nature and scheme-specific pledged/frozen-unit and Children's Fund lock-in exceptions.
  - Tata Neu HDFC: the issuer PDF updated 21 October confirms manual claims from 25 November, statement-based 12-month claim window, minimum 100 NeuCoins, up to three successful requests per day, and separate treatment for pre-25 November statements and promotional/welcome NeuCoins.
  - SBM ZET: current SBM secured-card MITC confirms the ZET-specific 5% late fee on total outstanding, ₹50 minimum, ₹1,000 maximum, and the more-than-three-days-past-due trigger. Product-specific clauses remain distinct.
- Other current repository entries were checked for duplication. The SBI Card Google Pay Flex Pay in EMI guide is already in main, but its public hub listing and article route remain independently unconfirmed in the public checker; this correction does not claim that guide is publicly live.
- RBI's 13 November Treasury-bill auction settled on 19 November and is no longer an upcoming consumer action. NPCI's 11 November Vyapaar Saksham scheme concerns merchant/acquirer acceptance incentives, not a universal consumer UPI fee. Neither warranted a new consumer guide.
- The Research Watch task's stored result was last recorded on 29 October and the task is disabled. Current repository publication records and fresh primary-source checks were used; no newer task run is inferred.

## Data-driven integration

- The existing `app/data/research-watch.ts` record was updated in place.
- The existing components already feed the homepage, Research Watch hub and November bulletin. The search-index generator reads Research Watch records, and `app/sitemap.ts` emits a route for every Research Watch item.
- The article's original publication date remains 16 November; its latest checked date is 19 November.
- No matching normalized Roarbank card detail record exists, so no card-page ranking or card record was changed. Existing Research/Research Watch navigation remains sufficient.
- No ranking formula, reward valuation, payments, authentication, customer/financial record, infrastructure, secret, paid resource or automation schedule was changed. No external message or comment was sent. The daily 10 AM report was not modified.

## Base and rollback

- Exact pre-edit main SHA: `a4af8d8504d33fc7981573b058d659dbe0958503`.
- Rollback branch: `backup/pre-roarbank-tariff-update-20261119-1558` (created from that exact SHA).
- Feature branch: `editorial/roarbank-tariff-update-20261119-1558`.

## Validation and production evidence

- Pending feature-branch unit tests, TypeScript, production build and Vercel preview.
- Pending review/merge of the exact intended feature head.
- Pending production deployment commit, READY status and public-page/source-link verification.
