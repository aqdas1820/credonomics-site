# Research Watch publication record — NPCI UPI dispute-rule changes from 25 November 2026

## Editorial decision

Publish one previously missed, source-verified consumer-finance update: NPCI/UPI/OC No. 240/2026–27, dated 4 November 2026, with URCS implementation from 25 November 2026. The circular changes specified bank/app back-office dispute names, reason codes and evidence mappings. It does not create a new customer-facing refund process, refund eligibility rule, complaint channel, deadline or compensation amount.

This was not present in the current `app/data/research-watch.ts`, the public Research Watch hub or the November bulletin before this change. The existing OC 241 P2M-routing article is separate and remains upcoming for 23 December 2026.

## Dates and audience

- Announcement date: 4 November 2026.
- Editorial check: 24 November 2026.
- URCS implementation date: 25 November 2026.
- Affected audience: UPI users who may need to dispute merchant payments, duplicate/multiple transactions, excess charges, wrong payments, cancelled/returned/defective/undelivered goods or services, or fraud-related debits.
- Primary addressees: UPI member banks and UPI application providers.
- Consumer status: specified internal URCS processing changes; no new customer-facing entitlement inferred.

## Reconciled primary documents

1. NPCI/UPI/OC No. 240/2026–27, dated 4 November 2026:
   https://www.npci.org.in/uploads/UPI_URCS_OC_240_Standardization_in_Dispute_Management_6f4a6542c3.pdf

2. NPCI/UPI/OC No. 241/2026–27, also dated 4 November 2026, separately implementing P2M routing from 23 December 2026:
   https://www.npci.org.in/uploads/UPI_URCS_OC_241_Revision_of_dispute_routing_logic_for_UPI_P2_M_transactions_in_URCS_1c6c076393.pdf

3. NPCI official UPI circular register:
   https://www.npci.org.in/circulars/upi

### Key reconciliation points

- OC 240 renames “Wrong Credit Chargeback” to “Wrong Payment – Reversal Request” for the listed raise/acceptance/rejection flags and permits that request and Fraud Chargeback for deemed-approved transactions after TCC updates.
- OC 240 revises codes 1063, 1085 and 131, discontinues code 1084 for Chargeback Raise (flag B), and adds specified codes for overcharges, duplicate/multiple payments, cancelled/returned, defective or undelivered goods/services, excess charges and Government Revenue Collection Payments.
- OC 240’s evidence table is a bank/app URCS workflow mapping. It does not require every consumer to file an FIR or NCRP report.
- OC 241 separately revises the 1061 and 1096 descriptions for its P2M routing specification and has a 23 December implementation date.
- OC 241 Annexure I still lists code 1084 for Online/UDIR Refund and Credit Adjustment. Therefore OC 240’s 1084 discontinuation is specific to Chargeback Raise (flag B), not global.
- OC 240’s Annexure TAT column is not represented as a new customer-facing refund SLA. OC 241 expressly says existing RBI-prescribed TATs and customer compensation remain unchanged for its routing change.
- No refund eligibility, process, new customer deadline or compensation entitlement is inferred.

## Website implementation

- Added the new item to `app/data/research-watch.ts` using the existing `WatchItem` data-driven article pattern.
- Set announcement date to 4 November, checked/published date to 24 November, and URCS event/effective date to 25 November.
- Advanced `WATCH_CHECKED_AT` to 24 November 2026.
- Existing data flow supplies the individual article, Research Watch hub, homepage and November bulletin.
- Existing production build regenerates the search index and sitemap.
- No separate navigation item is required; the existing Research navigation links to Research Watch.
- No card/fund record, card-ranking formula, reward valuation, payment, authentication, customer/financial record, infrastructure, secret or paid-resource file was changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `5f7d6351503863f45addc4ab2e4dd067f546d274`
- Rollback branch: `backup/pre-npci-upi-oc240-20261124-0046`
- Feature branch: `editorial/npci-upi-oc240-20261124-0046`
- Editorial check: 24 November 2026.

## Release evidence

To be completed after preview validation, PR review, merge, Vercel production build and public verification:
- Content PR and reviewed head SHA.
- Merge commit and final main SHA.
- Unit-test and TypeScript results.
- Search-index, IPO-data and static-page build results.
- Vercel production deployment ID, READY state and deployed commit.
- Public article, hub, homepage, November bulletin, search-index, sitemap and source-link checks.
- Final rollback reference.
