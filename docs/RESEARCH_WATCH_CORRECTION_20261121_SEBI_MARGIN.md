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
- Content PR #144: https://github.com/aqdas1820/credonomics-site/pull/144 (merged)
- Content merge commit: `765ed2b1dbf8e806325169790e9b88001e415f5e`
- Production deployment: `dpl_8Kk96uRrb8HRszrFghY3ffRE4faK` (READY; deployed commit matches the merge commit)
- Production deployment details: https://vercel.com/aqdasshaikh1820-9566s-projects/credonomics-site/8Kk96uRrb8HRszrFghY3ffRE4faK
- The Vercel production deployment reports aliases `www.credonomics.in` and `credonomics.in` assigned to that READY deployment.

## Publication pattern

The existing Research Watch data source drives the article, homepage cards, Research Watch hub, monthly bulletin, navigation, search index and sitemap. No separate card or fund record exists for this regulatory update, so no card/fund page or ranking formula is changed.

## Validation and public-release evidence

**GitHub PR #144** was merged after the exact intended head `ea9a404069e3c535401cac64f76e60cb9dd8498f` passed the Vercel preview build. The preview deployment was READY, but Vercel deployment protection prevented the public web checker from fetching the preview URL.

**Production deployment**
- Deployment ID: `dpl_8Kk96uRrb8HRszrFghY3ffRE4faK`
- State: READY
- Deployed commit: `765ed2b1dbf8e806325169790e9b88001e415f5e`
- Custom-domain aliases reported by Vercel: `www.credonomics.in` and `credonomics.in`
- Build output: 344 static pages generated; 141 search-index entries and 41 automated IPO dashboard records generated.

**Validation on the PR head and production build**
- Unit tests: 177 passed across 29 test files.
- Standalone TypeScript: `tsc --noEmit --pretty false` passed (the build proceeded to Next.js production compilation).
- Next.js production build: completed successfully; 344/344 static pages generated.
- Existing non-blocking CSS autoprefixer, React-hook ESLint and image-optimization warnings remained; no build error was reported.

**Public visibility limitation**
- The public article URL returned HTTP 200, but the retrieved page still showed the pre-correction 18 November title, summary, checked date and old action text.
- The Research Watch hub still listed the old commodity-margin summary/check date.
- The November bulletin returned an older snapshot.
- Public search and sitemap fetches returned Internal Error.
- Vercel confirms the custom-domain aliases point to the READY deployment and its deployed commit matches the merge commit, but the public content checker has not confirmed the revised article rendering. Therefore this release is recorded as merged and deployed, **not as publicly verified live content**. No cache, DNS, routing, infrastructure or deployment-protection settings were changed.

## Safeguards

- No card-ranking formulas, reward valuations or normalized product records changed.
- Payments, authentication, customer/financial records, infrastructure, secrets and paid resources untouched.
- No automation schedules changed.
- No external messages or comments sent.
