# Research Watch publication record — RBI EBT safeguards draft and SGB Series I price

## Editorial status

Two new source-checked updates prepared on 23 November 2026:

1. RBI's draft preventive safeguards for electronic banking transactions (EBTs), with the 14 December 2026 public-comment deadline.
2. The ₹12,612 per-unit premature-redemption price for SGB 2021–22 Series I due on 25 November 2026.

These are separate developments. The RBI safeguards are a draft consultation, not a final rule. The SGB request window closed on 16 November; the price notice does not reopen it.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `0de0109115c8b7a5068c5af7f106ae52c1315a14`
- Rollback reference: `backup/pre-rbi-ebt-sgb-20261123-1947`
- Feature branch: `editorial/rbi-ebt-sgb-20261123-1947`
- Editorial check: 23 November 2026

## RBI draft: dates and audience

- Announcement date: 23 November 2026.
- Checked date: 23 November 2026.
- Public comments due: 14 December 2026.
- Proposed main commencement: 1 July 2027, or earlier bank adoption.
- Proposed selected negligence-definition clauses: 1 January 2027; exact clauses differ by bank category.
- Affected institutions: commercial banks, small finance banks, payments banks, local area banks, regional rural banks, urban co-operative banks and rural co-operative banks.
- The proposal is not currently in force.

### Reconciled draft provisions

- Customer controls to disable/re-enable digital channels and set per-transaction, per-beneficiary, per-channel daily and aggregate daily limits, plus time windows.
- Card controls for domestic/international PoS, ATM, online and contactless use, subject to issuer limits; Gift PPI and Transit PPI cards are excluded.
- Stop Switch for customer-initiated outward debits. Ongoing recurring mandates, standing instructions, lien marking and bank-initiated recovery debits are excluded; inward credits continue.
- Digital channels disabled by default at onboarding, subject to the stated card-issue exceptions and 24-hour initial ceiling for other enabled channels.
- Voluntary Trusted Person Mechanism for transfers above a customer-set threshold, with UPI, merchant and specified recurring-payment exclusions. Trusted person must be 18+, identity-verified and use a distinct mobile number; proposed 24-hour activation cooling and one-hour response window. No account-operation or account-information access is conferred.
- Expanded definition of bank negligence includes specified control/authentication omissions, alerts and reporting failures, relevant system/security failures and employee/engaged-third-party collusion.
- No automatic refund, compensation or liability outcome is inferred.

### Exact primary sources

- RBI press release 2026-2027/1548, dated 23 November 2026: https://www.rbi.org.in/SCRIPTS/BS_PressReleaseDisplay.aspx?prid=64026
- Commercial Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5221
- Small Finance Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5222
- Payments Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5223
- Local Area Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5224
- Regional Rural Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5225
- Urban Co-operative Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5226
- Rural Co-operative Banks draft: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5227
- RBI discussion paper, 9 April 2026: https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=62535

Comments may be submitted by stakeholders through the corresponding Connect 2 Regulate links or to mcsdorfeedback@rbi.org.in by 14 December. No comment or external message was sent as part of this publication.

## SGB 2021–22 Series I: dates and audience

- Announcement date: 23 November 2026.
- Checked date: 23 November 2026.
- Premature-redemption date: 25 November 2026.
- Request window: 23 October–16 November 2026, now closed.
- Price: ₹12,612 per unit.
- Price basis: simple average of IBJA-published 999-purity gold closing prices for 19, 20 and 23 November 2026.
- Affected audience: holders of SGB 2021–22 Series I who submitted a request within the closed window.

### Exact primary sources

- RBI price notice 2026-2027/1552: https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64030
- RBI SGB calendar 2026-2027/938, row 23: https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63416

The price notice does not verify any individual's accepted request, unit count, payment-credit date or tax outcome. It does not reopen the request window and is not a recommendation to redeem.

## Website implementation

- Added both items to `app/data/research-watch.ts`.
- Existing `ResearchWatchBrief` data flow supplies Research Watch, homepage and November bulletin.
- Existing article template generates each source-checked article and canonical metadata.
- Existing search-index generator enriches Research Watch items.
- Existing `app/sitemap.ts` includes every Research Watch slug.
- No separate navigation item is needed; existing Research navigation already links Research Watch.
- No card or fund page, card-ranking formula, reward valuation or product data was changed.

## Scope safeguards

- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources changed.
- No external messages/comments sent.
- No automation schedules changed.
- Research Watch task `6adc4a968f4881919162894e39d400bc` remains in its existing disabled state.
- Daily 10 AM CredoNomics Daily Research remains in its existing state; no re-enable or reschedule was performed.

## Release evidence

### GitHub

- Content PR: [#154 — Publish RBI EBT safeguards draft and SGB Series I redemption price](https://github.com/aqdas1820/credonomics-site/pull/154)
- PR reviewed head SHA: `24a9a11ae2bda76783bd172b0a8e9bba0a773502`
- PR merge commit / post-publication main SHA: `611cfd6cb0894ce04b22cc51689bc3a4b2eff584`
- Pre-edit main SHA: `0de0109115c8b7a5068c5af7f106ae52c1315a14`
- Rollback branch preserving the exact pre-edit main: `backup/pre-rbi-ebt-sgb-20261123-1947`
- Evidence-refresh branch base: `611cfd6cb0894ce04b22cc51689bc3a4b2eff584`

### Validation

The existing Vercel Git build pipeline ran the repository's prebuild checks and the Next.js production build:

- Unit tests: **177 passed across 29 test files**.
- TypeScript: `npm run typecheck` completed successfully (`tsc --noEmit --pretty false`).
- IPO dashboard generator: **41 records generated**.
- Search-index generator: **142 CredoNomics search entries generated**, including the two new Research Watch items.
- Next.js 15.5.28 production build: compiled successfully; **346 static pages** generated, including:
  - `/research/watch/rbi-draft-electronic-banking-safeguards-november-2026`
  - `/research/watch/sgb-2021-22-series-i-premature-redemption-price-november-2026`
- Vercel preview deployment: `dpl_Dsb3qmaj8xgueBSQHZ4ss8GNd9vc`, **READY**, for reviewed head `24a9a11ae2bda76783bd172b0a8e9bba0a773502`.
- Vercel production deployment: `dpl_5Zivz3gHcSZTyXAznHd75F52oRX2`, **READY**, for main commit `611cfd6cb0894ce04b22cc51689bc3a4b2eff584`. Vercel assigned both `www.credonomics.in` and `credonomics.in`; the production deployment check reported success.
- Non-blocking pre-existing warnings remain for React Hook dependencies, `<img>` usage and CSS autoprefixer alignment. No build errors were reported.

### Public rendering verification limitation

The post-deployment public checker did not confirm the new content on the custom domain:

- `/research/watch`, `/updates/2026-11` and the homepage returned HTTP 200, but each still showed the earlier 23 November snapshot with the ICICI article at the top; neither new item appeared in the visible Research Watch list.
- Both new individual article URLs returned an Internal Error from the public checker.
- The public search endpoint and `/sitemap.xml` also returned Internal Error.
- Cache-busting query attempts did not resolve the discrepancy.
- The production deployment is READY and custom-domain aliases are assigned, but the public HTML/rendering mismatch remains unresolved. **Do not describe the new articles as publicly verified/live until the two article routes and the hub are independently confirmed.**
- No DNS, cache-purge, routing, infrastructure or access-control changes were attempted. The issue is recorded as a verification blocker rather than diagnosed speculatively.

### Source verification and prior batch recheck

- RBI draft press release 2026-2027/1548 and the seven bank-category draft documents (RBI IDs 5221–5227) were opened and checked. The consultation deadline and proposed status are stated separately.
- RBI SGB calendar 2026-2027/938 was opened; row 23 confirms the 2021–22 Series I request window and redemption date. RBI price notice 2026-2027/1552 was confirmed from the official RBI search result; its direct page fetch returned Internal Error during the check.
- The 24 October batch was re-read from the current `app/data/research-watch.ts` and rechecked against current issuer/fund documents: IDFC IndiGo; Amex 15 November MITC; HDFC Notice 1370 and 9 November KIM; Tata Neu HDFC claim PDF updated 21 October; SBM secured-card MITC. The SBM ZET late-fee effective date remains unspecified and was not inferred. No reward devaluation, refund process, ranking formula or valuation change was introduced.

### Final safeguards

- No payment, authentication, customer/financial-record, infrastructure, secret or paid-resource code changed.
- No card/fund product data, card ranking formulas or reward valuations changed.
- No external message or comment was sent.
- Research Watch task `6adc4a968f4881919162894e39d400bc` was already disabled; no schedule was changed.
- The daily 10 AM CredoNomics Daily Research task was already disabled in the available automation record; it was left unchanged. No automation was enabled, disabled, rescheduled or created in this run.
