# Research Watch release evidence — RBL rent/utility fees and HDFC BizBlack Metal recheck

## Editorial decision and dates

This release adds one new bank-wide card-fee update and refreshes an existing BizBlack Metal guide in place. No duplicate BizBlack article is created.

### RBL Bank rent and utility fees

- **Announcement date:** not separately stated in the current MITC.
- **Independent source check:** 26 November 2026.
- **Effective date:** 1 December 2026.
- **Affected audience:** RBL Bank credit-card holders using applicable rental merchants (MCC 6513) or utility merchants (MCC 4900).
- **Change:** The current MITC lists a 1% rental fee and a 1% utility fee when aggregate utility spends exceed ₹50,000 per month per card, then expressly states that no fee will be levied on either category from 1 December 2026.
- **Scope:** The MITC says it applies to all RBL Bank credit cards, but must be read with the Cardmember Agreement and product terms wherever applicable. MCCs are determined by the payment network. The fee change does not establish reward-point or milestone eligibility and does not waive separate payment-platform charges.

### HDFC Bank BizBlack Metal correction/recheck

- **Original publication date:** 18 November 2026.
- **Independent source recheck:** 26 November 2026.
- **Announcement date:** not separately stated in the revised terms or the cardholder communication body checked.
- **Reward/5X effective cycle:** statement cycle beginning 21 December 2026 (21 December 2026–20 January 2027).
- **Quarterly voucher effective date:** 1 January 2027.
- **Affected audience:** HDFC Bank BizBlack Metal cardholders using eligible tax-payment/accelerated-reward routes or tracking quarterly milestone vouchers.
- **Correction scope:** Adds the exact eligible channels, settlement/posting, reversal, PayZapp and card-upgrade exceptions from the current two-page revised T&C. HDFC's current product-page summary still displays the earlier ₹5 lakh milestone; the revised terms and linked change notice specify ₹4 lakh from 1 January 2027. The article discloses this current-page summary lag and does not assert when HDFC will refresh the page.

## Public article routes and shared patterns

- New RBL guide: https://www.credonomics.in/research/watch/rbl-credit-card-rent-utility-fee-removal-december-2026
- Updated HDFC BizBlack guide: https://www.credonomics.in/research/watch/hdfc-bizblack-tax-rewards-quarterly-voucher-december-2026
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/
- Search: https://www.credonomics.in/search?q=RBL
- Sitemap: https://www.credonomics.in/sitemap.xml

Both records use the existing `app/data/research-watch.ts` data model. The homepage, Research Watch hub and month-specific bulletin use the existing shared Research Watch components. `scripts/generate-search-index.mjs` reads Research Watch records from that data file, and `app/sitemap.ts` appends every Research Watch slug. Existing navigation already links to Research Watch.

No separate card page is changed: the RBL fee schedule is bank-wide and does not alter card-specific rewards; the HDFC item is an existing guide rechecked in place. No card/fund ranking formula, reward-point valuation or product eligibility model is changed.

## Primary-source verification

### RBL Bank

1. Current RBL Bank MITC linked from the official credit-card and terms pages: https://webassets.rbl.bank.in/document/Credit%20Cards/RBL-MITC-final.pdf
2. RBL Bank official Terms and Conditions page: https://www.rbl.bank.in/terms-and-conditions
3. RBL Bank official credit-card page: https://www.rbl.bank.in/personal-banking/cards/credit-cards

The MITC states at page 2 that it applies to all RBL Bank credit cards and is to be read with the Cardmember Agreement and product terms wherever applicable. Page 13 contains the rental and utility fee rows and the explicit 1 December 2026 removal clauses. Pages 13–14 list other fee rows and state that payment networks determine MCCs.

The article deliberately does not interpret the old utility fee as applying only to the amount above ₹50,000; the MITC wording does not specify that calculation. It also does not infer that rent/utilities earn reward points, that app/platform fees are removed, or that unrelated fuel/auto, selected education, FASTag/toll or merchant-EMI charges change.

### HDFC Bank BizBlack Metal

1. Revised two-page T&C: https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/business-credit-cards/biz-black/pdfs/biz-black-t-and-c.pdf
2. Cardholder communication: https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/business-credit-cards/biz-black/pdfs/biz-black-customer-communication-3-nov-2026.pdf
3. Current HDFC BizBlack Metal product page: https://www.hdfc.bank.in/business-credit-cards/biz-black-credit-card/onboarding

The revised T&C confirms the 4 RP per ₹200 Income Tax/GST core rate, 5 RP per ₹150 other eligible spend, 1,50,000 overall statement-cycle cap, ₹50,000 qualifying retail-spend threshold for 5X, 7,500 accelerated Business Essential points cap, named accelerated payment routes, settlement/posting and reversal rules, PayZapp exclusions, and the ₹4 lakh quarterly voucher threshold from 1 January 2027. It states that the product-page summary still shows the earlier ₹5 lakh milestone; the article explicitly discloses this difference rather than hiding it.

No point-to-rupee value, tax treatment, refund entitlement or account-specific reward outcome is inferred.

## GitHub baseline and rollback

- **Exact pre-edit main SHA:** `dd8c3ef66a8c47f3d69c5e562820fbdd7833d09b`
- **Rollback branch created at that exact SHA:** `backup/pre-rbl-rent-utility-20261126-2220`
- **Feature branch:** `research-watch-rbl-rent-utility-bizblack-20261126-2220`
- **Data commit:** `b5c9eb5c6be6e2fbb3dcca0a385f446110fa5ab0`

Build, test, preview and production deployment evidence will be appended after review and merge of the content PR. This initial record does not claim the new RBL article is publicly live.

## Scope and safeguards

Only the Research Watch data and this editorial evidence document are in scope. No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, card-ranking formulas or reward-valuation formulas are changed. No external messages or comments are sent. Automation schedules and task statuses are left unchanged. The saved daily 10 AM research-report task remains in its existing disabled state; it is not re-enabled or rescheduled by this publication run.
