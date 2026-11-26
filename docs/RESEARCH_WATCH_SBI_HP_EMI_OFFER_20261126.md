# Research Watch release evidence — SBI Card HP merchant-EMI offer

## Editorial decision and dates

Added one new, time-limited consumer-finance update for SBI Card's HP merchant-EMI promotion.

- **Issuer announcement date:** not separately stated on the SBI Card offer page.
- **Offer validity:** 21 November 2026 through 15 December 2026, inclusive.
- **Independent source check:** 26 November 2026.
- **Affected audience:** Existing SBI/Tata credit-card holders already considering an eligible HP laptop, desktop or PC during the offer period.
- **Publication scope:** A merchant promotion, not a permanent card feature or a recommendation to borrow.

## Article record and public routes

- Canonical article route: https://www.credonomics.in/research/watch/sbi-card-hp-emi-instant-discount-december-2026
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/

The article is data-driven through `app/data/research-watch.ts`. The shared Research Watch components feed the homepage, hub and month-specific bulletin. The existing build-time search-index generator reads Research Watch records from the same data file, and `app/sitemap.ts` appends every Research Watch slug to the sitemap. The production build generated 153 search entries and included the new article route and `/sitemap.xml`.

No individual card page was modified: the offer spans multiple SBI/Tata cards with product-specific exclusions, so attaching it to one card page would be misleading. Existing navigation already links to Research Watch.

## Verified offer details

- SBI Card's official page describes an **instant discount up to ₹15,000 per card** on eligible HP models. The linked SKU sheet lists model-specific amounts of ₹7,000, ₹10,000 or ₹15,000; the maximum is not universal.
- Only merchant-EMI transactions with a tenure of at least six months qualify.
- The issuer lists HP's online e-store powered by PinePG/PayU and selected offline stores using Pine Labs, PPSL (Paytm) or Benow EDC machines.
- Exclusions: SBI/Tata corporate cards, SBI Paytm co-brand cards, SBI Cashback cards, RuPay credit-card UPI transactions, and Flipkart SBI Card for online transactions.
- SBI Card calls the benefit an instant discount and says no later cashback will be posted, although the SKU sheet labels its amount column “Cashback”.
- Merchant-EMI interest and processing fees still apply.
- Full cancellation/return makes the transaction ineligible; partial cancellation is limited to the net amount paid. The issuer asks cardholders to retain the charge slip for 180 days after the programme ends.

## Qualifications and unresolved issuer wording

The article deliberately does not assert the following:

1. **Offline-store coverage:** SBI Card links a participating-store list PDF, but the file was too large to retrieve in this check. No individual offline store is named.
2. **Repeat-use frequency:** The offer-page summary says one use per card per aggregator per channel during the offer; detailed terms say once per card per aggregator per channel per month. No repeat-use entitlement is assumed.
3. **Offer stacking:** Detailed terms say two offers cannot be clubbed, but separately say the discount is over and above EMI interest subvention or manufacturer cashback/discount. No stacking entitlement is asserted.
4. **Universal discount:** ₹15,000 is only the maximum; the exact SKU list controls the amount.
5. **Announcement date:** No separate announcement date is shown by the issuer; the offer start date is not presented as the announcement date.

The article advises readers to compare the full EMI cost (interest, processing fee and applicable taxes) with the cash price and not to take an EMI solely for the discount. No reward valuation, card ranking or scoring formula changed.

## Primary sources

1. SBI Card official offer page: https://www.sbicard.com/en/personal/offer/hp-25nov26.page
2. SBI Card official model/SKU list: https://www.sbicard.com/sbi-card-en/assets/media/images/personal/offers/categories/shopping/hp-25nov26/Model%20List_HP.pdf

The offer page and linked model list were opened and checked. The separate offline-store list was not independently read.

## GitHub and rollback evidence

- **Pre-edit main SHA:** `95070a52c9e67276fac529d29001f991207b0ab9`
- **Rollback branch at that exact SHA:** `backup/pre-sbi-hp-offer-20261126-1822`
- **Feature branch:** `research-watch/sbi-hp-emi-offer-20261126-1822`
- **Content PR:** https://github.com/aqdas1820/credonomics-site/pull/194
- **Content PR head:** `d0dc3999246d9d24fb8d1b7faff92893b638b674`
- **Merge commit / main after content PR:** `6a11a8efc8725910620a512ff12904d660f43d55`

## Build and deployment evidence

Preview deployment:

- Deployment: `dpl_DvuqECpzR21fGxB7Tij1Q34QUWb8`
- State: READY
- Commit: `d0dc3999246d9d24fb8d1b7faff92893b638b674`
- Git status: success

Production deployment:

- Deployment: `dpl_FHDRc2mMgLT12KpLg2KnoSPoaJfB`
- State: READY
- Commit: `6a11a8efc8725910620a512ff12904d660f43d55`
- Production aliases assigned: `credonomics.in` and `www.credonomics.in`

Checks recorded in both preview and production builds:

- Unit tests: **29/29 test files, 177/177 tests passed**.
- TypeScript: `npm run typecheck` ran `tsc --noEmit --pretty false`; the build continued without a type error.
- Search index: **153 entries** generated.
- Automated IPO dashboard: **41 records** generated.
- Next.js production build: **358/358 static pages generated**; deployment completed.
- Existing non-blocking Autoprefixer, React Hook, image-optimization and webpack cache warnings remain.

## Public verification limitation

The Vercel production deployment is READY and its production aliases are assigned, but the external public-page checker returned Internal Error/Cache Miss for the new article, Research Watch hub, November bulletin, search and sitemap. The homepage fetch returned an old cached snapshot. Therefore the release is **deployed and build-verified, but public rendering is not independently confirmed**. Do not describe the article as publicly live-confirmed until a fresh public fetch succeeds.

## Scope and safeguards

Only `app/data/research-watch.ts` was changed for the content publication. No changes were made to payments, authentication, customer/financial records, infrastructure, secrets, paid resources, automation schedules or the daily 10 AM research-report configuration. No external messages or comments were sent.
