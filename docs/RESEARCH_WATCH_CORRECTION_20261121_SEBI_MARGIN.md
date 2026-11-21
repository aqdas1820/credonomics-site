# Research Watch correction — SEBI commodity-derivatives margin floors

**Editorial check:** 21 November 2026  
**Original article publication:** 18 November 2026  
**SEBI circular date:** 17 November 2026  
**Effective date:** 1 December 2026

## Correction and consumer relevance

The existing Research Watch guide already covered SEBI's revised minimum initial-margin (IM) and minimum Margin Period of Risk (MPOR) table. This correction adds the before/after comparison against the table in the 4 August 2023 Commodity Derivatives Master Circular that the 17 November 2026 circular expressly replaces.

| Volatility band | Agricultural IM: old → new | Agricultural MPOR: old → new | Non-agricultural IM / MPOR |
|---|---:|---:|---:|
| Low | 8% → 6% | 3 → 2 days | 6% / 2 days (unchanged) |
| Medium | 10% → 8% | 3 → 2 days | 8% / 2 days (unchanged) |
| High | 12% → 10% | 4 → 3 days | 10% / 3 days (unchanged) |

The update is limited to regulatory minimum floors. It does not establish the margin or cash collateral required for an individual contract. Exchanges and clearing corporations may impose higher margins and separate additional, pre-expiry, delivery-period or concentration margins. The article now explains that MPOR is a clearing-risk model parameter, not a customer payment grace period, and avoids suggesting that existing participants will necessarily see a lower broker margin.

## Primary sources independently checked

- SEBI circular dated 17 November 2026, effective 1 December 2026: https://www.sebi.gov.in/sebi_data/attachdocs/nov-2026/1794917100786.PDF
- SEBI official circular listing: https://www.sebi.gov.in/legal/circulars/nov-2026/review-of-margin-framework-for-commodity-derivatives-segment_105799.html
- SEBI Commodity Derivatives Master Circular dated 4 August 2023: https://www.sebi.gov.in/legal/master-circulars/aug-2023/master-circular-for-commodity-derivatives-segment_74974.html
- Original 2023 Master Circular PDF, paragraph 9.1.3.I.a(iv), pages 89–90: https://www.sebi.gov.in/sebi_data/attachdocs/aug-2023/1691151096694.pdf
- SEBI official commodity-derivatives circular listing, checked for intervening margin-framework revisions: https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&search=Commodity+Derivatives

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `cd5b24fd0c0cf399ec706686bd5ad55122b88aa3`
- Rollback branch preserving that exact SHA: `backup/pre-sebi-margin-clarification-20261121-2220`
- Feature branch: `editorial/sebi-margin-before-after-20261121-2220`
- Content commit: `cec29c1cf7ee66265f7d3f8131bc867d85af104e`
- Changed file: `app/data/research-watch.ts`
- Expected article URL: https://www.credonomics.in/research/watch/sebi-commodity-derivatives-margin-december-2026

## Publication pattern

The existing Research Watch data source drives the article, homepage cards, Research Watch hub, monthly bulletin, navigation, search index and sitemap. No separate card or fund record exists for this regulatory update, so no card/fund page or ranking formula is changed.

## Validation status at PR preparation

- Source and old/new table comparison reviewed.
- Exact main SHA and rollback reference preserved.
- Unit tests, standalone TypeScript, production build, preview and public-page verification: pending PR validation and deployment.

## Safeguards

- No card-ranking formulas, reward valuations or normalized product records changed.
- Payments, authentication, customer/financial records, infrastructure, secrets and paid resources untouched.
- No automation schedules changed.
- No external messages or comments sent.
