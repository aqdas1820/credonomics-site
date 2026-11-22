# CredoNomics Research Watch correction — Roarbank EMI foreclosure fee · 22 November 2026

## Editorial decision

This is a material status correction to the existing Roarbank guide, not a new fee announcement. The original guide was published on 16 November 2026. The 21 November effective date has now passed, so the guide and the global Research Watch check date were refreshed on 22 November.

- Affected audience: Unity Small Finance Bank Roarbank credit-card holders with an active Standard EMI or Partner EMI plan who are considering full early closure.
- Original publication date: 16 November 2026.
- Issuer announcement date: not separately stated in the documents reviewed.
- Effective date: 21 November 2026.
- Editorial verification date: 22 November 2026.

## Verified terms and limits

The September 2026 KFS and MITC separately list the previous 2% fee and the revised 3% fee effective 21 November for both Standard EMI and Partner EMI. The fee is calculated on remaining principal outstanding at foreclosure; applicable GST is additional. The MITC does not permit partial prepayments.

The current tariff page, checked on 22 November, displays a 3% early-repayment/foreclosure fee. The tariff page does not state the effective date; the dated KFS and MITC supply that date.

The issuer documents do not say whether a foreclosure request submitted before 21 November but processed on or after that date uses the request date or processing date. The guide retains this as unresolved and recommends a written payoff quote. No customer-specific fee is calculated.

## Primary sources

- [Unity Small Finance Bank — Roarbank credit-card Key Fact Statement](https://roar.unity.bank.in/doc/Key%20Fact%20Sheet%20Roarbank.pdf) — page 3, standard and Partner EMI fee rows, including 21 November effective-date rows.
- [Unity Small Finance Bank — Roarbank credit-card MITC](https://roar.unity.bank.in/doc/MITC%20Credit%20card.pdf) — pages 8, 21 and 30; standard and Partner EMI foreclosure clauses, no-partial-prepayment rule and worked calculation.
- [Roarbank current tariff page](https://roar.unity.bank.in/en/tariffs) — displays 3% for early repayment/foreclosure; no effective date shown.

## Repository and release

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `456c69c9f147ec53ee725508ef2f27d656a8989a`
- Rollback reference: [`backup/pre-roarbank-effective-status-20261122-0817`](https://github.com/aqdas1820/credonomics-site/tree/backup/pre-roarbank-effective-status-20261122-0817)
- Feature branch: `editorial/roarbank-effective-status-20261122-0817`
- Feature head: `5d32afe6018940c9aaee8a8968472041fe22f689`
- Content PR: [#146 — Update Roarbank EMI foreclosure fee to effective status](https://github.com/aqdas1820/credonomics-site/pull/146)
- Squash merge / content main commit: `12f05ecc64112ccea4cd4912e2b31a28ef93da3f`
- Changed file: `app/data/research-watch.ts` only.
- Production deployment: `dpl_7gkPM39CvvrN3nTLen8uJN7xGzXF` — Vercel READY; deployed commit matches the content main commit.
- Preview deployment for reviewed feature head: `dpl_CGbYiym2mGai2SUXJMq1FBokMjmK` — READY.

## Validation

The existing Vercel prebuild ran the repository's test, TypeScript, IPO-dashboard generation and search-index generation commands before the Next.js production build.

- Unit tests: 177 passed across 29 test files.
- Standalone TypeScript check: passed (`tsc --noEmit --pretty false`).
- Production build: completed successfully.
- Generated search entries: 141.
- Generated IPO dashboard records: 41.
- Static pages generated: 344.
- Non-blocking pre-existing CSS Autoprefixer, image, React-hook and npm configuration warnings remain; no build error occurred.

The existing data-driven article, homepage, Research Watch, November bulletin, search-index and sitemap patterns were retained. `WATCH_CHECKED_AT` and the Roarbank item's `checkedAt` now read 22 November 2026. The item's `publishedAt` remains 16 November and its `eventDate` remains 21 November, preserving the distinction between publication, check and effective dates. No card-detail record, ranking formula, reward valuation or financial product data was changed.

## Public verification limitation

Vercel's production deployment is READY and the Vercel alias records map both `www.credonomics.in` and the apex redirect to the new production deployment. However, the public-page checker still returned the previous 20 November Roarbank article content, and the Research Watch hub, November bulletin and homepage still displayed the previous 21 November check snapshot. Public search and sitemap fetches returned Internal Error. A cache-busted public fetch also failed.

Therefore, the source data is merged and deployed, but updated public rendering has **not** been independently confirmed. Do not describe this correction as publicly verified until the article and hub show the 22 November check. No DNS, alias, cache, route, infrastructure or paid-resource change was made to force visibility.

## Research review and HOLDs

- Research Watch task `6adc4a968f4881919162894e39d400bc` was already disabled; its latest recorded run was 29 October 2026.
- The 24 October initial batch was re-read: IDFC IndiGo international rewards, Amex November changes, the two HDFC fund exit windows, Tata Neu HDFC manual claims and SBM ZET fees. Product-specific exceptions remain; SBM ZET's effective date remains HOLD.
- The 21–22 November discovery scan did not produce another fully issuer-verified consumer update. Equitas redemption changes remain unconfirmed by the issuer; the Kotak Private card's primary KFS was not retrieved; Axis and UNIFI mutual-fund notice annexures could not be independently retrieved. These were not published.
- No blanket refund, reward-devaluation, customer-compensation or eligibility claim was inferred.

## Safeguards

Payments, authentication, customer/financial records, infrastructure, secrets, paid resources, card-ranking formulas and automation schedules were unchanged. No external messages or comments were sent. The separate daily 10 AM research report was already disabled when checked; it was left unchanged and was not re-enabled or rescheduled.
