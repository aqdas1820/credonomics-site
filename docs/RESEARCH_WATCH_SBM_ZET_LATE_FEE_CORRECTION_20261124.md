# Research Watch correction record — SBM ZET late-payment fee

## Correction summary

On 24 November 2026, the current official SBM Secured Credit Card MITC was re-read. The product-specific table lists a flat ₹299 late-payment fee for SBM ZET. The 5% of outstanding amount, capped at ₹1,000, row belongs to SBM Kredit.Pe, not SBM ZET. The MITC does not show a ₹50 minimum for the ZET row and does not state a separate effective date for the ₹299 fee.

The previously published SBM ZET article incorrectly attributed the Kredit.Pe row to ZET. The article is corrected with an explicit correction note. This is a correction of the product mapping in the current MITC, not a claim that the ₹299 fee first became effective on 24 November. No refund, waiver or fee-reversal process is inferred.

## Dates and affected audience

- Editorial check/correction date: 24 November 2026.
- Original article publication date retained: 24 October 2026.
- Separate announcement date: not stated in the current MITC.
- ZET late-fee effective date: not stated in the current MITC.
- Affected audience: SBM ZET secured credit-card holders only. Other SBM variants have different rows.

## Primary-source verification

Official issuer MITC:
https://www.sbm.bank.in/pdf/terms-conditions/SBM-Secured-Credit-Card-T%26C.pdf

Checked locations:
- PDF page 8, section A(vi): more-than-3-days-past-due trigger and product-specific late-payment table.
- The same table lists SBM ZET at ₹299 and SBM Kredit.Pe at 5% of outstanding, capped at ₹1,000.
- PDF page 7, Table 07: separate 1% rental and education transaction fees effective 15 July 2026.

Verified details:
- The MITC says late-payment charges apply when the statement outstanding remains past due for more than 3 days.
- It defines the trigger as no payment or payment below the Minimum Amount Due by Payment Due Date +3 days.
- The late-payment fee is charged on the outstanding amount.
- SBM ZET: ₹299.
- SBM Kredit.Pe: 5% of outstanding, maximum ₹1,000.
- No ₹50 minimum is shown for the ZET row.
- A separate 1% rental/education transaction fee applies to eligible SBM ZET transactions effective 15 July 2026; it is not the late-payment fee.
- No separate effective date for the ₹299 ZET late-fee row is stated.

## Website implementation

- Existing article slug retained: `sbm-zet-late-fee-october-2026`.
- Article title and summary corrected.
- `checkedAt` updated to 24 November 2026; original `publishedAt` retained as 24 October 2026.
- Explicit `updateNote` records the correction and identifies the mistaken cross-product attribution.
- Research Watch hub, homepage brief, November bulletin, search index and sitemap use the existing data-driven `researchWatch` collection.
- No card ranking, reward valuation, payment, authentication, customer record or financial workflow is changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-correction main SHA: `ec9018a399108e003ababc87b02c1cb58d1c5ed8`
- Rollback branch: `backup/pre-sbm-zet-correction-20261124-2119`
- Correction/evidence branch: `editorial/sib-bulk-fd-release-evidence-20261124-2119`
- PR and deployment evidence: pending.

## Scope safeguards

No external messages/comments sent. No automation schedules changed. No payment, authentication, customer/financial-record, infrastructure, secret or paid-resource files changed. No card/fund ranking formula or reward valuation changed.
