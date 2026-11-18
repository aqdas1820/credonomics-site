# Research Watch publication · 19 November 2026

Base production `main` SHA: `3d73748162dbee05ea3298a8e68deca834ce65a6`.

Rollback reference: `backup/pre-research-watch-amex-indianbank-20261119` (points to the exact base SHA above).

Feature branch: `editorial/research-watch-amex-indianbank-20261119`.

## New publication-worthy items

### 1. SEBI Chairman statement on Direct Plans

- Announcement date: 28 October 2026.
- Stated effective date: 1 November 2026.
- Independently checked: 19 November 2026.
- Affected audience: people making new mutual-fund purchases on AMC-operated digital platforms.
- The official SEBI speech says Direct Plans would be the default on AMC digital platforms from 1 November, and investors choosing Regular Plans must be informed about their higher expense ratio.
- The speech is an official primary source, but it is not an implementing circular. The article attributes the statement to the Chairman and does not claim that every third-party app, distributor portal, bank portal or exchange route follows the same default.
- No app-by-app rollout was independently confirmed. No automatic conversion of existing units or SIPs is claimed. Implementation details remain unverified and are explicitly disclosed as a limitation.

Primary sources:

- https://www.sebi.gov.in/media-and-notifications/speeches/oct-2026/address-by-chairman-at-ndtv-profit-ignite_105475.html
- https://www.sebi.gov.in/sebi_data/attachdocs/oct-2026/1793194286661.pdf
- https://www.sebi.gov.in/sebi_data/attachdocs/mar-2026/1774024028162.pdf

The 20 March 2026 SEBI Master Circular, Part III section 3.4, describes Direct Plan as a separate plan for investments not routed through a distributor, with a lower expense ratio because no distribution commission is paid and a separate NAV. This context does not turn the Chairman’s speech into an implementing circular.

### 2. Indian Bank ₹3–5 crore bulk term-deposit schedule

- Official table status date: 17 November 2026 (the bank labels it “as on 17.11.2026”).
- Independently checked: 19 November 2026.
- Separate announcement date and exact commencement date: not stated on the reviewed bank page.
- Affected audience: depositors considering ₹3–5 crore bulk term deposits at Indian Bank. This is not the retail schedule for deposits below ₹3 crore.
- For one year and above one year to less than two years, the published annual rates are 6.00% callable and 6.05% non-callable. For 181 days to under nine months and nine months to under one year, they are 5.50% callable and 5.55% non-callable.
- The table also lists 4.50% for 7–14 days; 5.00% for 15–45 days; 5.00% callable / 5.05% non-callable for 46–90 days; 5.25% / 5.30% for 91–180 days; and 5.50% for both options from two years onward.
- The bank says bulk deposits of ₹3 crore and above do not receive the additional senior-citizen rate. It also says Treasury Branch approval is required for bulk deposits of ₹3 crore and above, including same-day aggregate deposits of an individual customer.
- The bank’s page says revised domestic term-deposit rates apply only to fresh deposits and renewals of maturing deposits.
- No before/after movement is claimed because the reviewed page does not provide the prior bulk-rate table. No post-tax yield or maturity value is estimated.

Primary source:

- https://indianbank.bank.in/en/deposit-rates/

### 3. Amex November guide correction

- Official MITC date: 15 November 2026.
- Independently rechecked: 19 November 2026.
- The 15 November credit-card MITC says eligible refunds and reversals received by the card payment due date, where payment has not been made by then, are adjusted towards the Minimum and Total Amount Due, including when the credit arrives after the statement is generated.
- The clause is credit-card-only. It uses the word “eligible” but does not define which merchant credits qualify or describe a separate request process. The guide does not infer blanket refund eligibility, a refund process or a processing timeline.
- The MITC does not state a separate commencement date for this clause. No separate effective date is inferred from the document date.

Primary sources:

- https://www.americanexpress.com/en-in/support/digital/consumer-experience-updates/
- https://www.americanexpress.com/content/dam/amex/in/legal/mitc/Lending_MITC_English.pdf

## Corrections and status refreshes from the open prior PR #117

PR #117 was still open and based on an older base SHA; it was not treated as a completed publication. Its proposed updates were reviewed against current primary sources and only verified portions were integrated into this branch. The PR was not merged wholesale.

### Axis movie offers

- Effective date: 1 November 2026. Checked: 19 November 2026.
- Current issuer PDFs retrieved for MYZONE, NEO and PRIVILEGE confirm a ₹25,000 spend condition in the previous three months for their respective District or BookMyShow offers.
- The three PDFs say only transactions settled during the preceding three calendar months count; settlement can take up to five working days. They specify the new-card issuance waiver, account-level treatment, excluded charges/refunds/reversals and EMI treatment.
- The SELECT PDF returned HTTP 403 at this check. Its November condition remains HOLD and is not inferred from the other card variants.

Primary sources:

- https://campaign.axis.bank.in/generic/terms-and-conditions-myzone.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-neo.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-privilege.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-select.pdf

### Axis complimentary membership consent

- Effective date: 15 November 2026. Checked: 19 November 2026.
- The official one-page Axis PDF lists five hotel memberships and Priority Pass across nine card variants. The guide now carries the full card-to-membership matrix.
- Axis says detailed consent and renewal instructions will be shared closer to each membership renewal date; no individual renewal date or consent deadline is invented.

Primary source:

- https://campaign.axis.bank.in/generic/opt-in-termsandconditions-24June.pdf

### PNB credit-card service charges

- PNB index publication date: 3 October 2026. PDF effective date: 1 November 2026. Checked: 19 November 2026.
- The revised-charge PDF scopes the ₹99 reward-redemption fee and threshold utility fee to Visa/RuPay variants. The source location is corrected to PDF page 5. Other PNB products and FD-backed/Luxura terms remain separate.

Primary sources:

- https://creditcard.pnb.bank.in/Documents/revised-charges.pdf
- https://www.pnb.bank.in/Public-Notices.aspx

### IDFC FIRST international rewards and IndiGo BluChip correction

- Checked: 19 November 2026.
- FIRST Select and FIRST Millennia product pages list 10X on international purchases under their card-specific terms.
- FIRST Wealth’s headline says 10X on international spends, while its detailed section says international spends done on the cardholder’s birthday. This conflict remains HOLD; no general Wealth international rate is claimed.
- The current IndiGo FIRST Dual FAQ lists 1 BluChip on international spends but does not show a per-₹100 denominator. The earlier per-₹100 wording is not repeated.
- No reward-point cash conversion, complete cap valuation or ranking change is made.

Primary sources:

- https://www.idfcfirst.bank.in/content/dam/idfcfirstbank/pdf/credit-card/Credit-Card-Communication-13-Sep-26.pdf
- https://www.idfcfirst.bank.in/credit-card/select
- https://www.idfcfirst.bank.in/credit-card/millennia
- https://www.idfcfirst.bank.in/credit-card/wealth
- https://www.idfcfirst.bank.in/credit-card/indigo-credit-card

### HDFC fund change

- Notice date: 1 October 2026. Effective date: 9 November 2026. Optional exit deadline: 6 November 2026 at 3 pm IST. Checked: 19 November 2026.
- Notice 1370 applies to HDFC Balanced Advantage Fund and HDFC Children’s Fund. It says the exit offer was optional and no action was required if a unitholder had no objection; the notice also specifies lock-in, pledge/encumbrance and frozen-unit conditions.
- The 9 November KIM is for HDFC Balanced Advantage Fund only. It is not used as a substitute for the common notice.

Primary sources:

- https://files.hdfcfund.com/s3fs-public/2026-10/1370%20-%20Notice%20cum%20Addendum%20-%20Change%20in%20Fundamental%20attributes%20of%20Schemes%20-%20w.e.f.%20-%20November%2009,%202026.pdf
- https://files.hdfcfund.com/s3fs-public/KIM/2026-11/KIM%20-%20HDFC%20Balanced%20Advantage%20Fund%20dated%20November%2009%2C%202026.pdf?VersionId=Yz8lz0_R_QJ4Ym_DtoHQd6bRlvc34wXb

### PNB ATM/CRM notice status

- PNB’s current public-notice index, last updated 18 November, still lists the 25 September notice with a 1 November effective date.
- The underlying PDF was not retrievable in this pass. The existing published detailed terms were not changed or newly re-asserted; the item’s status/date note now makes this limitation explicit.

Primary source:

- https://www.pnb.bank.in/Public-Notices.aspx

## Re-read of the 24 October initial batch

- IDFC IndiGo international rewards: current FAQ lists 1 BluChip on international spends but does not show a per-₹100 denominator; the previous wording is held pending issuer clarification.
- American Express November changes: current Consumer Experience Updates page and 15 November credit-card MITC were re-read. The eligible refund/reversal adjustment clause above is the material addition. Product-specific rules and unresolved milestone/restoration wording remain explicit.
- HDFC Balanced Advantage Fund and HDFC Children’s Fund: Notice 1370 still identifies the exit window through 3 pm on 6 November and the change effective 9 November. No extension was found.
- Tata Neu HDFC manual claims: HDFC’s PDF remains updated 21 October and states that manual claims begin for statements from 25 November. It applies to the primary cardholder; the claimable balance is available within seven working days of the statement date, card-earned NeuCoins have a 12-month claim window, up to three successful requests per day are allowed with a 100-NeuCoin minimum, and special-promotion/welcome rewards follow their own expiry terms.
  - https://www.hdfc.bank.in/kannada/content/dam/hdfcbankpws/in/en/pdfs/TataNeuCC_neucoins_Claim.pdf
- SBM ZET fees: the current repository record remains product-specific and states the published 5% of outstanding late fee, bounded by ₹50 and ₹1,000 before GST, from 23 October. Direct retrieval of the official PDF was unavailable in this pass, so no new revision or correction is asserted.
  - https://www.sbm.bank.in/pdf/terms-conditions/SBM-Secured-Credit-Card-T-C.pdf

## Other screening and deduplication

- The SEBI Direct Plan statement was absent from the current Research Watch and November bulletin. It was the October 29 Research Watch task’s high-priority HOLD; the official speech PDF is now readable. The publication is deliberately limited to the verified speech statement, while implementation details remain unverified.
- The Indian Bank bulk schedule is separate from the existing under-₹3 crore special-retail-FD guide. No retail/bulk rate mixing or before/after claim was added.
- Draft fund filings without a confirmed offer opening or complete investor-facing terms were not promoted to publication.
- PNB’s 16 November credit-related service-charge notice appears in the bank index but was not treated as a retail consumer fee change; its exact audience and terms require separate review. The savings-account interest-credit-cycle notice remains HOLD pending retrieval of the underlying notice.
- Current public Research Watch, November bulletin, homepage and existing Amex article were inspected before editing. The existing Research Watch, homepage and monthly bulletin are data-driven; the search-index generator and sitemap consume the same Watch data. No matching normalized card-detail records exist for the affected IDFC, Axis and PNB variants, and no individual HDFC fund detail route exists, so no card/fund detail page was fabricated.
- No card ranking formula, reward valuation, customer or financial record was changed.

## Scope safeguards

Editorial content only. Payments, authentication, customer/financial records, infrastructure, secrets, paid resources and automation schedules were left unchanged. The separate daily 10 AM research report was not changed. No external messages or comments were sent.

## Release verification

- Pull request: pending.
- Reviewed feature-branch head: pending.
- Unit tests: pending.
- TypeScript: pending.
- Production build: pending.
- Vercel preview: pending.
- Production deployment and public-route verification: pending.
- Final merge commit: pending.
- Rollback branch points to the exact pre-edit production `main` SHA shown above.
