# CredoNomics Research Watch — verification refresh (18 November 2026)

## Release scope and provenance

- Repository: `aqdas1820/credonomics-site`
- Exact `main` base SHA preserved before editing: `ba106d5f4bb550a10a4ed751d167394eb543b55a`
- Rollback reference: `backup/pre-research-watch-corrections-20261118` (points to the exact base SHA above)
- Feature branch: `feat/research-watch-corrections-20261118`
- Research Watch task: `6adc4a968f4881919162894e39d400bc`
- The task's latest recorded run is 29 October 2026; no later recorded run was available and the task is currently disabled. No automation schedule was changed. The separate daily 10 AM research report was left untouched.
- Data update commit: `2ff7009d4f545b8722405166fd2e4830ba2e8420`
- Changed data file: `app/data/research-watch.ts` only, plus this release note.

## Verified additions and corrections

### IDFC FIRST international rewards

Rechecked the 13 September revised communication and the current FIRST Select, FIRST Millennia and FIRST Wealth product pages. All three current product pages still list 10X Reward Points on international purchases, subject to their own exclusions and terms. The separate IndiGo FIRST Dual FAQ lists 1 BluChip per ₹100 of international purchases from 26 October. The guide now distinguishes reward currencies and card variants; it does not claim a universal rate or convert points into cashback.

Primary sources:
- https://www.idfcfirst.bank.in/content/dam/idfcfirstbank/pdf/credit-card/Credit-Card-Communication-13-Sep-26.pdf
- https://www.idfcfirst.bank.in/credit-card/select
- https://www.idfcfirst.bank.in/credit-card/millennia
- https://www.idfcfirst.bank.in/credit-card/wealth
- https://www.idfcfirst.bank.in/credit-card/indigo-credit-card

The existing IndiGo guide now shows the 26 October rule as effective at the 18 November check.

### HDFC Mutual Fund — two scheme changes

Notice 1370 is dated 1 October 2026, applies to HDFC Balanced Advantage Fund and HDFC Children’s Fund, and states that the scheme-attribute change took effect on 9 November. The optional exit window for eligible unitholders closed at 3 pm IST on 6 November. The current HDFC Balanced Advantage Fund KIM located in this check is dated 9 November; the common Notice 1370 remains the primary document for both schemes.

Primary sources:
- https://files.hdfcfund.com/s3fs-public/2026-10/1370%20-%20Notice%20cum%20Addendum%20-%20Change%20in%20Fundamental%20attributes%20of%20Schemes%20-%20w.e.f.%20-%20November%2009,%202026.pdf
- https://files.hdfcfund.com/s3fs-public/KIM/2026-11/KIM%20-%20HDFC%20Balanced%20Advantage%20Fund%20dated%20November%2009%2C%202026.pdf?VersionId=Yz8lz0_R_QJ4Ym_DtoHQd6bRlvc34wXb

No recommendation to redeem or hold was added. The article does not describe strategy mechanics or infer any refund, tax or exit-load treatment beyond the notice.

### Axis Bank membership consent

Rechecked the central Axis opt-in PDF and expanded the guide from four reviewed card variants to every card/membership pairing in the central table. The consent-based renewal rule is effective from 15 November. The exact consent journey and each membership’s renewal date remain separate; no app path or universal deadline is inferred.

Primary source:
- https://campaign.axis.bank.in/generic/opt-in-termsandconditions-24June.pdf

Supporting card-specific terms:
- https://campaign.axis.bank.in/generic/terms-and-conditions-select.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-magnus.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-magnus-burgundy.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-reserve.pdf

### Axis movie eligibility

Rechecked the four current card-specific notices. The ₹25,000 eligible-spend condition for MYZONE, SELECT and PRIVILEGE District offers and NEO’s BookMyShow discount is now effective from 1 November. Settlement timing, calendar-month lookback, issuance exceptions and card-specific limits remain explicit.

Primary sources:
- https://campaign.axis.bank.in/generic/terms-and-conditions-myzone.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-neo.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-select.pdf
- https://campaign.axis.bank.in/generic/terms-and-conditions-privilege.pdf

### PNB card and ATM/CRM schedules

The PNB Visa/RuPay credit-card fee guide now marks the 1 November schedule as effective. The PNB public-notice index lists 3 October as the publication date. The ATM/CRM guide now marks the 1 November schedule as effective; the current index still lists the 25 September notice.

Primary sources:
- https://creditcard.pnb.bank.in/Documents/revised-charges.pdf
- https://creditcard.pnb.bank.in/
- https://www.pnb.bank.in/Public-Notices.aspx

No retroactive fee, refund or earlier-transaction treatment is inferred. Card-type and account-specific exceptions remain in the guides.

## Rechecked; no new publication change

- Amex November changes: the 15 November issuer terms remain the current verified basis. The separate service-restoration status was not promoted because the official experience page could not be re-opened in this check and the restoration dates remain inconsistent.
- Tata Neu HDFC manual claims: the current HDFC document still points to the 25 November cutover; it remains clearly upcoming.
- SBM ZET: the current MITC still supports the published fee terms; no new change was found.

## Held — not published

- SEBI direct-plan default: the Chairman’s official speech states an intended 1 November default on AMC digital platforms, but no separate implementing circular or independently verified platform behaviour was located. It is not described as a binding rule.
  - Official speech: https://www.sebi.gov.in/sebi_data/attachdocs/oct-2026/1793194286661.pdf
- PNB credit-related service-charge notice effective 16 November: the material located is concentrated in business-credit/trade-finance rows; no general retail-borrower fee change was independently verified.
- PNB savings-account interest-credit-cycle notice: the public-notice index surfaced the item, but the underlying notice could not be independently retrieved and reconciled.
- FATCA/CRS reporting changes: the SEBI material located addresses intermediary reporting obligations; no clear new retail-customer action or deadline was verified.
- Amex service restoration: the official experience page returned an access error and published restoration timings conflict. No restoration, refund or eligibility outcome is inferred.

## Site integration

The existing Research Watch data model drives the homepage, `/research/watch`, the November bulletin, the mutual-funds category feed, generated search index and sitemap. Those surfaces are expected to refresh through the normal build. Navigation was already present and was not changed. No matching normalized card-detail records exist for the affected IDFC, Axis and PNB variants, so no unrelated card page or ranking formula was edited.

## Safety and scope controls

- No card/fund ranking formula or valuation was changed.
- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources were changed.
- No automation schedule was changed; the daily 10 AM report remains untouched.
- No external messages or comments were sent.

## Validation and deployment evidence

- GitHub PR: to be recorded in the PR metadata and final release summary.
- Existing unit-test workflow: pending.
- TypeScript and production build: pending Vercel preview.
- Production deployment: not yet performed; merge is gated on review and passing checks.
