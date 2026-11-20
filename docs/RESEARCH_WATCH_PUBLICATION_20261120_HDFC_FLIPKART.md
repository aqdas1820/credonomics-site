# Release evidence — Flipkart Wholesale HDFC card migration notice

## Publication

- Content PR: https://github.com/aqdas1820/credonomics-site/pull/134
- Content merge commit: ac28582dcc8151fc5bbcaf005e19422cbdc82716
- Feature branch: editorial/hdfc-flipkart-wholesale-20261120-1126
- Exact pre-edit main SHA: 8d35612c361d7aba370c7994174d9ee83e694c35
- Rollback reference: https://github.com/aqdas1820/credonomics-site/tree/backup/pre-hdfc-flipkart-wholesale-20261120-1126

## Primary source

- HDFC Bank official product page: https://www.hdfc.bank.in/business-credit-cards/flipkart-wholesale-credit-card
- Checked: 20 November 2026.
- Customer communication date stated by HDFC: 31 October 2026.
- Cashback cessation effective date: 1 December 2026.
- Eligible November cashback credit timing stated by HDFC: first week of December 2026.
- The notice says existing customers are being migrated to another HDFC Bank credit card. The public page does not identify each replacement variant or individual migration date.
- The page retains older cashback benefit and application sections below the Important Information notice. The guide is limited to existing cardholders and does not infer whether new applications remain open, nor does it infer the transfer of mandates, credit limits, replacement-card benefits or treatment of late-posted transactions.

## Validation evidence

- Isolated validation branch: validation/hdfc-flipkart-wholesale-final-20261120-1126
- Validation commit: 01f3237b0af18b72839926f0fde0b3be1f73dfa5
- Standalone TypeScript check: passed.
- Unit tests: 177 passed across 29 files.
- Search index generated: 138 entries.
- Next.js production build: passed.
- Static pages generated: 341.
- Generated routes include:
  - /research/watch/hdfc-flipkart-wholesale-card-phaseout-cashback-december-2026
  - /research/watch
  - /updates/2026-11
  - /sitemap.xml
- Vercel validation preview: READY, deployment dpl_4bCPDHr3C2xGtgzAw8Ly6DTnEL8V.
- Production Vercel deployment: READY, deployment dpl_J5M7ytd7bMZLRfFQ1b1Ny3ADoZSN.
- Deployed production commit: ac28582dcc8151fc5bbcaf005e19422cbdc82716.
- Production aliases assigned by Vercel: www.credonomics.in and credonomics.in.

## Public-visibility limitation

The production deployment is READY and Vercel reports both custom-domain aliases assigned, but public content verification is not complete:

- Direct public fetch of the new article route returned Internal Error on the web checker.
- The public Research Watch hub still displayed “Latest publication · 19 November 2026” and its previous item list.
- The public November bulletin still displayed “Latest check 2026-11-19” and the previous item list.
- The public homepage still displayed “Latest check 2026-11-19”.
- Public sitemap fetch returned Internal Error.
- A direct container HTTP check could not resolve www.credonomics.in (DNS resolution failure).
- The official HDFC source page remained accessible and independently confirms the notice.

Accordingly, the repository contains the new article and the production deployment is READY, but public visibility is not claimed as independently verified. This note records the blocker rather than asserting that the content is live.

## Scope safeguards

- No card-ranking formula, normalized card record or valuation changed.
- No payment, authentication, customer/financial record, infrastructure, secret or paid-resource changes.
- No automation schedule or task state changed.
- Research Watch task 6adc4a968f4881919162894e39d400bc was already disabled; latest recorded result was 29 October 2026.
- The separate daily 10 AM research report was already disabled; it was left unchanged as requested.
- No external messages or comments were sent.
