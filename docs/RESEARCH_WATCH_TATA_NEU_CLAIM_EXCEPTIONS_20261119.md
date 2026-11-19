# Research Watch correction · Tata Neu HDFC manual NeuCoins claims · 19 November 2026

Exact pre-edit production `main` SHA: `4a55849666151dc77350d295252762036ec1737a`.

Rollback reference: `backup/pre-tata-neu-claim-exceptions-20261119` (created from that exact SHA).

Feature branch: `editorial/tata-neu-claim-exceptions-20261119`.

## Verified correction

- Existing article: [Tata Neu HDFC manual NeuCoins claims](https://www.credonomics.in/research/watch/tata-neu-hdfc-manual-neucoins-claims-november-2026).
- Affected audience: primary holders of Tata Neu Plus and Tata Neu Infinity HDFC Bank credit cards.
- Original publication date retained: 24 October 2026.
- Issuer document: HDFC Bank's Tata NeuCoins Claim and Redemption Process PDF, marked updated 21 October 2026.
- Checked: 19 November 2026.
- Claim-process effective date: 25 November 2026.
- Separate announcement date: not stated in the issuer PDF.

The current official PDF confirms the already-published 25 November manual-claim start, 100-NeuCoin minimum, up to three successful requests per day, 7-working-day statement/claim availability, and separate unclaimed-versus-claimed expiry rules. This correction adds material card-status and replacement exceptions that were not stated in the live guide:

1. HDFC says a closed or blocked Tata Neu HDFC card cannot be used to claim NeuCoins or credit them to the Tata Neu Membership account while that status applies. The PDF directs the customer to HDFC for details; it does not describe an alternative payout route.
2. For a lost/stolen card that is reissued, the existing unclaimed balance transfers from the old card to the new card within 7 working days. After transfer, the eligible balance is available to claim within 7 working days of the next statement generation. HDFC states the same timing for a card-variant change.
3. After a bank-registered mobile-number change, new card issue, variant change or reissue, card details or statement NeuCoins may not appear immediately. HDFC directs the primary holder to NeuCard > Already have a NeuCard / Verify your NeuCard and complete verification.
4. The previously recorded up-to-3-working-day wait after HDFC unblocks a card at the holder's request remains in the guide. The blocked-card restriction and post-unblocking wait are presented together without inferring any individual entitlement.

Primary source (full exact official URL):
https://www.hdfc.bank.in/kannada/content/dam/hdfcbankpws/in/en/pdfs/TataNeuCC_neucoins_Claim.pdf

Evidence locations: updated-date header and claim process on page 1; claimable balance and expiry on page 2; verification and blocked/closed-card rule on page 3; lost/stolen reissue and variant-change transfer rules on page 4.

## Research and deduplication

- Re-read the 24 October initial-batch records in current `app/data/research-watch.ts` and their official documents: IDFC FIRST IndiGo (current product page confirms 1 BluChip per ₹100 and zero forex markup); Amex November credit-card MITC (15 November document, including its narrowly worded eligible refund/reversal clause); HDFC Mutual Fund Notice 1370 and 9 November Balanced Advantage KIM (exit window closed 6 November; lock-in, pledge, encumbrance and frozen-unit exceptions retained); Tata Neu HDFC claim PDF (this correction); and current SBM secured-card MITC (ZET-specific fee, 3-day trigger, issuance-date cancellation clock, and separately dated rental/education charges).
- Rechecked the current public homepage, Research Watch hub, October and November bulletins, Tata Neu Plus and Infinity card pages, and the existing Tata Neu guide before editing. The article already appears in the October bulletin by original publication date and in the November bulletin by its later check date.
- Existing `cardIds` link the guide to both Tata Neu Plus and Infinity card pages. The homepage, Research Watch hub, monthly bulletins, and those card pages consume the existing data-driven `ResearchWatchBrief`; the search-index prebuild reads the Research Watch data and the sitemap loops over the same entries. No separate navigation or route-code change is required.
- Research Watch task `6adc4a968f4881919162894e39d400bc` is disabled and its latest recorded result is 29 October 2026; no newer result is recorded. Later repository evidence in PRs #119–#122 was reviewed. A fresh 19 November primary-source scan found an RBI overnight VRRR liquidity auction notice, which does not create a consumer action; no additional publication-worthy issuer/regulator development was established in this short interval.
- No refund eligibility, alternative payout process, blanket devaluation, or individual account outcome is inferred.

## Safeguards

Editorial content only. No card-ranking formulas, reward valuations, payments, authentication, customer/financial records, infrastructure, secrets, paid resources, or automation schedules are changed. The daily 10 AM research report remains untouched. No external messages or comments are sent.

## Validation and release evidence

- Unit tests: **177 passed across 29 files**. GitHub Actions run [#44425138397](https://github.com/aqdas1820/credonomics-site/actions/runs/44425138397) completed successfully on validation branch `validation/tata-neu-claim-exceptions-20261119`; it tested the same application content as the reviewed feature branch.
- TypeScript: **passed**.
- Production build: **passed**. The build generated **133 CredoNomics search entries** and **334 static pages**, including the Research Watch dynamic route, October and November bulletins, `/search`, and `/sitemap.xml`.
- Vercel preview: **READY**, deployment `dpl_86pRndXEK9AhqmLnM5xH8sJ4CPMj`, for feature-branch head `cbc189ad2ed774e858edd06b462e6065e02bf0cd`.
- Content PR: [#123](https://github.com/aqdas1820/credonomics-site/pull/123), merged 19 November 2026. Merge commit and production `main` SHA: `943558bb4f8f95ead8f0a12a1e03588899d45635`.
- Vercel production: **READY**, deployment `dpl_AYoeTGJPT5zX7M5PZJzwrpZNeSpp`, serving the merged commit with aliases `www.credonomics.in` and `credonomics.in`. Build completed; existing non-blocking lint, image and Autoprefixer warnings in unrelated files remain.
- Rollback branch `backup/pre-tata-neu-claim-exceptions-20261119` was rechecked and points exactly to the pre-edit main SHA `4a55849666151dc77350d295252762036ec1737a`.
- Public pages verified: [the Tata Neu guide](https://www.credonomics.in/research/watch/tata-neu-hdfc-manual-neucoins-claims-november-2026) (the trailing-slash request redirected to the canonical route and displayed the 19 November correction), [homepage](https://www.credonomics.in/), [Research Watch hub](https://www.credonomics.in/research/watch), [October bulletin](https://www.credonomics.in/updates/2026-10), [November bulletin](https://www.credonomics.in/updates/2026-11), [Tata Neu Plus card page](https://www.credonomics.in/cards/tata-neu-plus-hdfc), and [Tata Neu Infinity card page](https://www.credonomics.in/cards/tata-neu-infinity-hdfc). The guide shows the blocked/closed-card rule, reissue/variant transfer timing, and 19 November check date. The official [HDFC Bank claim PDF](https://www.hdfc.bank.in/kannada/content/dam/hdfcbankpws/in/en/pdfs/TataNeuCC_neucoins_Claim.pdf) was opened from the live article; its four pages support the published details.
- Search and sitemap integration: build-time search generation reported 133 entries; `scripts/generate-search-index.mjs` reads `app/data/research-watch.ts`, and `app/sitemap.ts` adds every `researchWatch` slug. The web checker could not directly fetch the query-string search results or `/sitemap.xml`; their public endpoints are therefore not claimed as independently browser-verified in this run.
- An earlier no-trailing-slash crawler snapshot of the guide showed the prior 16 November text; the trailing-slash canonical redirect returned the updated 19 November page. Homepage, hub, both bulletins and both card pages also returned the updated summary.
- No ranking formula, reward valuation, payment/authentication flow, customer/financial record, infrastructure, secret, paid resource or automation schedule was changed. The daily 10 AM research report was left untouched. No external messages or comments were sent.
