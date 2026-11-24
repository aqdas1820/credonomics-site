# Research Watch publication record — SEBI PR 75/2026 pre-listing-premium advisory

## Editorial decision

Publish one new Markets/investor-safety guide based on SEBI Press Release 75/2026, dated 23 November 2026. The advisory concerns unofficial pre-listing premium figures commonly called grey market premium (GMP) for upcoming IPOs.

The article explains that SEBI describes these figures as unofficial, unverified and unregulated; warns investors not to treat them as listing-price or expected-return indicators; advises investors to refrain from related transactions; and states that disputes do not have the listed SEBI/exchange investor-protection or grievance-redressal routes.

The article does not publish any pre-listing premium figures, platform names, access links, transaction instructions or listing-gain forecasts. It does not call the press release a new statutory ban on every discussion. SEBI's wording says publication may be discontinued and advises SEBI-registered intermediaries and market participants to refrain from publishing, displaying or broadcasting such figures.

## Dates and affected audience

- Announcement date: 23 November 2026.
- Editorial check and publication date: 24 November 2026.
- Effective date: no separate effective date is stated in PR 75/2026.
- Affected audience: retail investors reviewing upcoming IPOs, plus SEBI-registered intermediaries and market participants who publish or distribute IPO-related information.
- Status: investor advisory, not a new IPO scoring rule or a published effective-date regulation.

## Primary-source verification

1. SEBI Press Release 75/2026 PDF, dated 23 November 2026:
   https://www.sebi.gov.in/sebi_data/attachdocs/nov-2026/1795441481174.pdf

2. SEBI official press-release page for PR 75/2026:
   https://www.sebi.gov.in/media-and-notifications/press-releases/nov-2026/advisory-regarding-unregulated-pre-listing-premium-often-called-as-grey-market-premium-gmp-for-upcoming-initial-public-offers-ipos-_105942.html

3. SEBI Recognised Intermediaries directory:
   https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes

4. CredoNomics IPO Data Score methodology:
   https://www.credonomics.in/ipo/methodology

### Reconciled interpretation

- PR 75/2026 says pre-listing premium figures are unofficial, unverified and unregulated; the purported transactions occur before formal listing and outside the recognised exchange framework, without regulatory oversight, settlement guarantee, investor protection or formal price discovery.
- The release says publication, display, circulation or dissemination of such figures may be discontinued across the securities market. It advises SEBI-registered intermediaries and market participants to refrain from publishing, displaying or broadcasting the figures on websites, platforms and other communication channels, including email, SMS and social media.
- Investor advice is to avoid treating these figures as listing-price or expected-return indicators, refrain from related transactions, and transact in IPOs exclusively through SEBI-registered intermediaries and authorised platforms.
- For disputes arising from or relating to these transactions, the release says investor-protection benefits under SEBI or stock-exchange jurisdiction are unavailable, as are exchange-administered grievance mechanisms and the exchanges/depositories' Online Dispute Resolution portal.
- The release does not specify a separate effective date. The article therefore uses 23 November as the announcement date and 24 November as the check/publication date, not as an effective date.
- CredoNomics' existing IPO methodology already excludes this unofficial signal from its fundamental Data Score. No score weights, ranking formulas, valuation assumptions or IPO records are changed.
- The separate SEBI PR 76/2026 impersonation warning was already present as an update to the existing 22 October WhatsApp-stock-tip guide and was not duplicated.

## Website implementation

- Added one source-backed WatchItem to `app/data/research-watch.ts` with separate announcement, checked/publication and advisory dates.
- The existing data-driven article route is `/research/watch/sebi-ipo-prelisting-premium-investor-advisory-november-2026`.
- The existing Research Watch data flow supplies the hub, homepage Research Watch brief and November bulletin.
- The existing production prebuild search-index generator reads Research Watch entries; `app/sitemap.ts` imports the same data and adds each article URL.
- Existing Research navigation already links to Research Watch; no navigation change is needed.
- Updated `app/ipo/methodology/page.tsx` to link the existing GMP-exclusion explanation to SEBI PR 75/2026. No scoring formula or weight changed.
- No card or mutual-fund record is directly affected.
- No payment, authentication, customer/financial-record, infrastructure, secret or paid-resource file is changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `26cfd5c8f8b67fb283d49869525b0c432b6032af`
- Rollback branch: `backup/pre-sebi-gmp-advisory-20261124-2022`
- Feature branch: `editorial/sebi-gmp-advisory-20261124-2022`
- Editorial check: 24 November 2026.

## Release evidence

Preview build, tests, TypeScript, production build, PR review/merge, production deployment and public-page verification will be recorded here after completion. No release is considered public until the article, hub, homepage, November bulletin and primary-source links are checked against the production domain.
