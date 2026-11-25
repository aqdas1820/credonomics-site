# Research Watch SBM ZET source-link redirect correction — 25 November 2026

## Review and repository baseline

- Checked: 25 November 2026, 11:22 IST.
- Repository: `aqdas1820/credonomics-site`.
- Exact pre-correction `main` SHA: `6e5e1f1537cb1d137cad9d38394f63f1cf9b6651`.
- Rollback reference created before this correction: `backup/pre-sbm-redirect-correction-20261125-1122`.
- Editorial branch: `editorial/sbm-redirect-correction-20261125-1122`.
- Prior PR #173 merge commit: `6e5e1f1537cb1d137cad9d38394f63f1cf9b6651`.
- Prior Vercel production deployment: `dpl_4XfhfKMxFWT6fYZjQLEsYvzNQjv3`, READY on the pre-correction main SHA. Its public article fetch still returned the pre-PR text, so the HOLD wording from PR #173 was not independently confirmed as public.

## Further source reconciliation — 25 November 2026, 11:49 IST

The official SBM secured-credit-card page lists a separate “MITC & CMA” link under the SBM ZET Credit Card:

https://www.sbm.bank.in/personal-banking/cards/secured-credit-card

Following that ZET-specific product-page link on 25 November resolved to the 52-page consolidated terms-and-conditions PDF:

https://www.sbm.bank.in/pdf/terms-conditions/SBM-Secured-Credit-Card-T&C.pdf

The consolidated PDF’s Table No. 08 (page 10) lists SBM ZET late-payment charges at 5% of Total Outstanding Due, with a ₹50 minimum and ₹1,000 maximum, plus GST. The surrounding text states the more-than-three-days-past-due trigger and refers to Payment Due Date +3 days. The 5% row still does not state an effective date.

A separate direct fetch of the legacy notice-board URL returned a distinct older PDF:

https://www.sbm.bank.in/pdf/notice-board/SBM-ZET-Credit-Card-MITC.pdf

That returned document has its own Table No. 08 and lists SBM ZET at INR 299. It contains older 2020-era illustrative examples and is not the 52-page PDF reached through the current product-page link.

This means the earlier statement that the notice-board URL consistently redirects to the consolidated document, and that no separate accessible ₹299 document exists, was too broad. The current product-page link resolves to the consolidated 5% schedule, but a direct fetch of the legacy URL still surfaced a separate older document. We do not infer that the ₹299 row remains effective, nor that the 5% row has a particular commencement date.

Editorial correction: the public guide now distinguishes the current product-page link target from the legacy direct-fetch result, reports both exact official URLs, leaves the 5% effective date unconfirmed, and advises cardholders to ask SBM which MITC version and effective date applies to their statement. No account-level fee outcome is inferred.

The consolidated document separately lists a ₹499 cancellation fee within two years from card issuance and 1% rental and education transaction fees effective 15 July 2026. Those are separate product-specific provisions, not evidence of the late-fee effective date.

## Recheck of the 24 October initial batch

The existing records in `app/data/research-watch.ts` and their current issuer/fund documents were re-read. No duplicate articles or ranking changes were made.

- **IDFC FIRST IndiGo:** current product page shows 1 BluChip per ₹100 international spend, 0% forex markup, no points on cash/EMI transactions, variable BluChip redemption value and an earning ceiling up to the card's credit limit per billing cycle. The 13 September issuer communication confirms rewards continue alongside zero forex markup.
  - https://www.idfcfirst.bank.in/credit-card/indigo-credit-card
  - https://www.idfcfirst.bank.in/content/dam/idfcfirstbank/pdf/credit-card/Credit-Card-Communication-13-Sep-26.pdf
- **American Express:** current MITC states it is updated 15 November 2026. Eligible refunds/reversals received by the payment due date, where payment has not been made, adjust the Minimum and Total Amount Due. A separate clause says a credit balance caused by overpayment or merchant credit should be refunded on request through the card-back phone number or app chat, with NEFT details ready. No broader eligibility, automatic refund, deadline or outcome is inferred.
  - https://www.americanexpress.com/content/dam/amex/in/legal/mitc/Lending_MITC_English.pdf
- **HDFC Mutual Fund:** Notice 1370 is dated 1 October; the optional exit window was 8 October to 3 pm on 6 November; covered-call changes took effect 9 November. Pledge/encumbrance, freeze and Children’s Fund lock-in exceptions remain. No extension was found.
  - https://files.hdfcfund.com/s3fs-public/2026-10/1370%20-%20Notice%20cum%20Addendum%20-%20Change%20in%20Fundamental%20attributes%20of%20Schemes%20-%20w.e.f.%20-%20November%2009,%202026.pdf
- **Tata Neu HDFC:** issuer PDF updated 21 October and effective 25 November. Manual claiming applies to spend-earned NeuCoins on statements generated on/after 25 November; earlier statements retain automatic transfer. Minimum 100 NeuCoins per claim and up to three successful requests per day; blocked/closed-card, unblocking, reissue and variant-change exceptions remain.
  - https://www.hdfc.bank.in/kannada/content/dam/hdfcbankpws/in/en/pdfs/TataNeuCC_neucoins_Claim.pdf
- **SBM ZET:** current consolidated MITC re-read. 5%/₹50/₹1,000 row is supported by the current consolidated PDF; effective date is not stated. The notice-board URL redirects to the same document; no separate current ₹299 ZET schedule was verified.

## Other current candidates and duplicate checks

- **ICICI Bank credit-card notices:** the official notice board lists a change effective 25 November 2026 and separate notices for 11 and 15 December. The full notice PDF and exact affected-card rows could not be independently retrieved from the issuer page in this run. Keep detailed claims HOLD; do not reproduce competitor-only card lists or fees.
  - https://www.icici.bank.in/about-us/notice-board
- **Roarbank EMI foreclosure:** current KFS and MITC state 3% of remaining principal plus applicable GST from 21 November for Standard EMI and Partner EMI; the current tariff page and dedicated EMI page now also display 3%. The request-submitted-before/processed-after transition remains unresolved. Existing article already covers this; no duplicate.
  - https://roar.unity.bank.in/doc/Key%20Fact%20Sheet%20Roarbank.pdf
  - https://roar.unity.bank.in/doc/MITC%20Credit%20card.pdf
  - https://roar.unity.bank.in/en/tariffs
  - https://roar.unity.bank.in/en/emi
- Existing Ujjivan SFB FD/RD, South Indian Bank MCLR/bulk-FD, NPCI OC240/241, RBI securitisation and EPFO proposal entries were inspected in current main and deduplicated against Research Watch, the November bulletin and release records. No additional verified change was added.
- Union Mutual Fund merger and Axis MF scheme-specific subscription candidates remain HOLD where the original official annexures could not be read.

## Website integration

The existing data-driven Research Watch record is updated in place; the slug is preserved:
`/research/watch/sbm-zet-late-fee-october-2026`

The existing data source drives the Research Watch hub, homepage brief, November bulletin, search index and sitemap. No separate navigation, card-ranking, fund-ranking or reward-valuation change is required.

Public pages inspected before and after the previous release:
- https://www.credonomics.in/
- https://www.credonomics.in/research/watch
- https://www.credonomics.in/updates/2026-11
- https://www.credonomics.in/research/watch/sbm-zet-late-fee-october-2026

After PR #173's READY deployment, the public article fetch still returned the pre-PR 5% title/summary rather than the HOLD text. This is recorded as a stale public-rendering observation; it is not evidence that the HOLD version was live. Recheck the article after the corrective deployment.

## Safeguards and automation

- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources changed.
- No card/fund ranking formula, reward valuation or financial-service workflow changed.
- No external messages or comments sent.
- No automation schedules changed.
- Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled; its latest recorded result is 29 October 2026 (SEBI Direct Plan proposal, then HOLD).
- The separate daily 10 AM CredoNomics Daily Research automation remains in its pre-existing disabled state (last run recorded 8 November 2026); it was not re-enabled or rescheduled.
- The separate Publish CredoNomics Research automation remains enabled; its schedule was not changed.

## Release evidence

Append the corrective PR/head SHA, preview checks, merge commit, production deployment identity/state, deployed commit match, public article/hub/bulletin/homepage checks, search/sitemap checks and source-link verification after the corrective release. A READY deployment alone is not proof of public visibility.


## Corrective release evidence — PR #174

- Corrective PR: https://github.com/aqdas1820/credonomics-site/pull/174
- Reviewed PR head SHA: `3439903f3fa2e1d3e0e662f9049841bb0a99238b`.
- PR #174 merge commit / final main SHA at content release: `dc1a0f1d80f445e97c6f4617f3122b65c77c7807`.
- Preview deployment: `dpl_9fKXMReyShxj8XafRySrgAymmwbT`, READY for the reviewed PR head.
- Production deployment: `dpl_FuxBoJUfSQnq48VcKoGzHG9UmeAF`, READY; deployed commit matches the final main SHA. Production aliases assigned: `www.credonomics.in` and `credonomics.in`.
- Preview/production prebuild: 177/177 unit tests passed; TypeScript passed; 41 automated IPO records generated; 149 search entries generated; Next.js production build completed and 353 static pages generated. Existing non-blocking Autoprefixer, React Hook and `<img>` optimization warnings remain.
- Public article verified: https://www.credonomics.in/research/watch/sbm-zet-late-fee-october-2026. It displays the consolidated MITC's 5% late-fee formula, ₹50 minimum, ₹1,000 maximum, and explicitly says the effective date is not stated.
- Public Research Watch hub, November bulletin and homepage were fetched successfully and include the SBM ZET entry, checked 25 November 2026.
- At the PR #174 check, the current product-page link was followed to the consolidated 52-page MITC. A later direct fetch of the legacy notice-board URL surfaced a distinct older PDF listing ₹299; this source-path discrepancy is documented in the follow-up correction.
- Public search and `/sitemap.xml` fetches returned Internal Error to the external checker. Search-index generation (149 entries) and static page generation passed in the build, but public search/sitemap endpoints are not claimed as independently verified.
- PR #174 correctly followed the current product-page link to the consolidated 5% MITC, but its broader statement about the legacy URL and the absence of an accessible ₹299 document is superseded by the 25 November follow-up source reconciliation.
- No new consumer-finance rule or ranking formula was introduced; this release corrects source interpretation and effective-date wording only.
- No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, external messages/comments or automation schedules were changed.

## Release-evidence repository update

- Pre-evidence-edit main SHA: `dc1a0f1d80f445e97c6f4617f3122b65c77c7807`.
- Backup reference: `backup/pre-sbm-release-evidence-20261125-1122`.
- Evidence-only branch: `editorial/sbm-release-evidence-20261125-1122`.
- The evidence-only PR and its documentation deployment are recorded in GitHub history; this section records the content publication deployment, not a second content release.
