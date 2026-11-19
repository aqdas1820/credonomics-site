# Research Watch correction · SBI Card Pay in EMI terms · 19 November 2026

## Withdrawal and HOLD decision

The Google Pay Flex SBI Pay in EMI guide added in content PR #125 is withdrawn from the public Research Watch feed because the current issuer source conflicts with the earlier captured version used for that guide. No rate or processing-fee claim is being republished until SBI Card provides a dated clarification or a stable, reconcilable notice.

- Checked: 19 November 2026.
- Current official source: https://www.sbicard.com/en/pay-in-emi-tnc.page
- Separate announcement/revision date: not stated.
- SBI Card's currently accessible page states, in clauses 11–12, that from 11 September 2026 the annual rates are 22.00%–26.00% for bureau scores of 700 or below, 16.50%–19.50% for 701–780, and 10.00%–16.00% above 780. It states a promotional processing-fee waiver for 24- and 36-month bookings from 11 September; other tenures carry 1% of booking amount or ₹2,000, whichever is lower.
- An earlier captured version of the same issuer URL during this review displayed a different effective date and different rate/waiver terms (12 November 2026; different score bands; 18-, 24- and 36-month fee waiver). The current customer-notices page did not provide a dated Pay in EMI notice that reconciles the two versions.
- Because the issuer has not supplied a dated revision record or separate notice explaining the difference, neither version is treated as a verified change. The item is on HOLD and removed from the public data feed. The current 11 September wording is recorded here for audit only, not as a new consumer update.

## Stable product-specific context (audit only)

The currently accessible terms page describes this as a select-customer offer for Indian residents with a valid primary Google Pay Flex SBI Credit Card, available only through the Google Pay app. It excludes delinquent or otherwise ineligible cardholders and add-on cardholders, limits conversion to eligible retail transactions in the latest bill, sets a ₹2,500 minimum booking amount, and requires at least ₹30,000 for the 36-month tenure. These restrictions do not resolve the contradictory rate/fee clauses, so no public article is retained.

## Primary sources checked

1. SBI Card, Pay in EMI Terms & Conditions (current clauses 1–13 and 15–20):  
   https://www.sbicard.com/en/pay-in-emi-tnc.page
2. SBI Card, Customer Notices:  
   https://www.sbicard.com/en/customer-notices.page
3. SBI Card, Most Important Terms & Conditions:  
   https://www.sbicard.com/en/most-important-terms-and-conditions.page

The Pay in EMI terms page is the product-specific source. The customer-notices page did not surface a dated Pay in EMI revision. No competitor claim is used to resolve the discrepancy.

## Research and deduplication

- The 24 October initial batch was re-read against current files: IDFC IndiGo international rewards, Amex November MITC changes, HDFC Balanced Advantage/Children's Fund optional exit window, Tata Neu HDFC manual claims and SBM ZET fees. Existing product-specific exceptions remain; no duplicate updates were created.
- The separate SBI Card December transport/fuel-fee guide is unrelated and remains unchanged.
- NPCI's 11 November Vyapaar Saksham circular concerns merchant/acquiring-member acceptance incentives, not a new universal consumer UPI charge. RBI/SEBI searches did not establish another new consumer-actionable notice in this review window. Contradictory or legally incomplete items remain on HOLD.
- Research Watch task `6adc4a968f4881919162894e39d400bc` was found, but its stored run result could not be read. Available prior conversation context, current repository records and fresh primary-source checks were used; no task result is inferred.

## Repository correction and safeguards

- The SBI Pay in EMI record is removed from `app/data/research-watch.ts`. The existing data-driven homepage Research Watch brief, hub, November bulletin, search index and sitemap will regenerate without this item.
- No generic SBI card page or normalized card record was changed; no card ranking formula or reward valuation was changed.
- No payment flows, authentication, customer/financial records, infrastructure, secrets, paid resources or automation schedules are changed. The daily 10 AM research report is left untouched. No external messages or comments are sent.

## Release and rollback history

- Original pre-article main SHA: `cdf7fad49982608e50464ba2fc3f2eb269606933`.
- Original pre-article rollback branch: `backup/pre-sbi-pay-in-emi-20261119`.
- Incorrect content PR #125 merged as `7be284f49be1362169d1514f5e955e9433acd6ee`; its Vercel production deployment was READY, but public visibility was not independently confirmed.
- Release-evidence PR #127 merged as `522e92b6a7350385712054eb23901f8342719714`.
- Exact pre-withdrawal main SHA: `522e92b6a7350385712054eb23901f8342719714`.
- Withdrawal rollback branch: `backup/pre-withdraw-sbi-pay-in-emi-20261119`.
- Withdrawal feature branch: `editorial/withdraw-sbi-pay-in-emi-20261119`.

## Validation

Withdrawal PR validation, preview build, merge, production deployment and post-deploy public-page verification are pending. The item must remain absent from the public feed until the source discrepancy is resolved.
