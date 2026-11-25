# Research Watch release evidence — ICICI card changes

## Editorial verification

- Checked: 25 November 2026, 16:24 IST.
- Original article publication date retained: 12 November 2026.
- Issuer announcement/publication date: not stated in the current notice.
- First effective date: 25 November 2026 (named business, corporate and purchase-card variants only).
- Later effective dates: 11 December 2026 (retail card and Priority Pass replacement rows); 15 December 2026 (named insurance and INOX benefit rows).
- Current main SHA before edits: `16b9153dae00a985861c9bc7a82e1344a6630337`.
- Rollback reference: `backup/pre-icici-card-recheck-20261125-1624`.
- Feature branch: `research-watch/icici-card-recheck-20261125-1624`.

## Primary sources checked

1. [ICICI Bank credit-card features and charges notice (11-page PDF)](https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/revamp-page-images/docs/pdf/credit-card-charges-updated-notice.pdf) — pages 1–2 for 11/15 December retail-card rows; pages 4–6 for 25 November business, corporate and purchase-card rows.
2. [ICICI Bank retail-card MITC, updated 19 November 2026](https://www.icici.bank.in/managed-assets/docs/personal/cards/mitc_cc.pdf) — pages 9–11 for physical-card replacement amounts, Priority Pass replacement list and retail DCC rates/exceptions.
3. [ICICI Bank official notice board](https://www.icici.bank.in/about-us/notice-board).

## Editorial treatment

- The earlier HOLD was removed only after the current official PDF became retrievable and its relevant pages were checked.
- 25 November DCC/replacement changes are limited to the exact business, corporate and purchase-card variants listed by the issuer.
- 11 December physical-card replacement and Priority Pass replacement are separate rows with different product lists and exceptions.
- 15 December insurance and INOX withdrawals are limited to the named card/benefit rows.
- No publication date was invented. No effect on individual existing bookings, claims, refunds or compensation was inferred.
- Existing `publishedAt` date remains 12 November; `checkedAt` is 25 November.
- Existing card IDs are linked only because each is covered by the general physical-card replacement row.
- No reward valuation, card ranking formula, payment, authentication, customer record, infrastructure, secret or paid resource was changed.
- Research Watch data automatically feeds the hub, homepage, November bulletin, linked card pages, search index and sitemap.

## Validation and release

- Content PR: [#180 — Verify ICICI card fee and benefit changes](https://github.com/aqdas1820/credonomics-site/pull/180), merged.
- Content merge commit: `a8ccb71d65a6737de443c90a65919790f40835e3`.
- Preview deployment: `dpl_6ai6cAsEqAkAEP57d3m6qgFnnFSJ`, READY for PR head `4b28912408e40aa93ccce665ca310f27011c44f5`.
- Production deployment: `dpl_oN5ggbM3yxQLoks6qaKgyt2SjGS3`, READY; deployed commit matches the content merge commit.
- Production aliases assigned: `www.credonomics.in` and `credonomics.in`.
- Vercel build executed the repository prebuild and production build:
  - Unit tests: 29 test files, 177 tests passed.
  - TypeScript: `tsc --noEmit --pretty false` passed.
  - IPO dashboard generator: 41 records.
  - Search-index generator: 149 entries.
  - Next.js production build completed; 353 static pages generated.
- Existing non-blocking warnings remain in unrelated CSS/autoprefixer, React Hook and image-optimization checks.
- Public production verification returned HTTP 200 for:
  - [ICICI card article](https://www.credonomics.in/research/watch/icici-card-replacement-insurance-inox-november-december-2026), with the 25 November and 11/15 December distinctions, product-specific fees, benefit lists and exact official PDF/MITC links.
  - [Research Watch hub](https://www.credonomics.in/research/watch).
  - [November bulletin](https://www.credonomics.in/updates/2026-11).
  - [Homepage](https://www.credonomics.in/).
  - Relevant linked card pages: [Amazon Pay](https://www.credonomics.in/cards/amazon-pay-icici), [Coral](https://www.credonomics.in/cards/icici-coral), [Rubyx](https://www.credonomics.in/cards/icici-rubyx), [Sapphiro](https://www.credonomics.in/cards/icici-sapphiro), [HPCL Super Saver](https://www.credonomics.in/cards/icici-hpcl-super-saver).
  - [Search results for ICICI](https://www.credonomics.in/search?q=ICICI), showing the updated article title and route.
  - [Sitemap](https://www.credonomics.in/sitemap.xml), containing the article route.
- Both primary issuer documents are present as exact links in the article and independently accessible: the 11-page current features-and-charges notice and the retail MITC updated 19 November 2026.
- Publication is publicly verified. The 25 November business/corporate/purchase-card changes are effective; 11 December and 15 December retail-card changes remain clearly upcoming.
- No reward valuation or card-ranking formula changed.
- No payment, authentication, customer/financial record, infrastructure, secret or paid resource was changed. No external message/comment was sent. No automation schedule was changed.
- Pre-edit main SHA: `16b9153dae00a985861c9bc7a82e1344a6630337`.
- Exact rollback branch: [`backup/pre-icici-card-recheck-20261125-1624`](https://github.com/aqdas1820/credonomics-site/tree/backup/pre-icici-card-recheck-20261125-1624).
- Feature branch: `research-watch/icici-card-recheck-20261125-1624`.
