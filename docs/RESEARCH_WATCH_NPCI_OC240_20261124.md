# Research Watch publication record — NPCI UPI OC 240/2026–27

## Editorial decision

One new, source-verified consumer-facing guide is being published for NPCI UPI Operating Circular OC 240/2026–27. The circular was issued on 4 November 2026 and its URCS dispute-management changes take effect on 25 November 2026.

The guide explains the back-office reason-code and indicative-evidence changes without turning them into a new customer refund process, a universal document checklist, a chargeback guarantee or a customer-facing resolution deadline.

The existing OC 241/2026–27 guide was rechecked on 24 November and updated with a clear cross-reference. OC 240 and OC 241 are separate circulars: OC 240 covers reason codes/evidence from 25 November; OC 241 covers applicable UPI P2M dispute routing from 23 December, subject to its own exceptions.

## Exact primary sources

- NPCI UPI OC 240/2026–27, dated 4 November 2026: https://www.npci.org.in/uploads/UPI_URCS_OC_240_Standardization_in_Dispute_Management_6f4a6542c3.pdf
- NPCI UPI OC 241/2026–27, dated 4 November 2026: https://www.npci.org.in/uploads/UPI_URCS_OC_241_Revision_of_dispute_routing_logic_for_UPI_P2_M_transactions_in_URCS_1c6c076393.pdf
- NPCI official UPI circular register: https://www.npci.org.in/circulars/upi

## OC 240: verified scope and dates

- Announcement date: 4 November 2026.
- Checked date: 24 November 2026.
- URCS implementation date: 25 November 2026.
- Addressed to: all UPI members and UPI application providers.
- Subject: Standardization of Dispute Management Rules in URCS.

### Reconciled provisions

- “Wrong Credit Chargeback” is renamed “Wrong Payment - Reversal Request”, including the WC, WA and WR flags.
- Wrong Payment - Reversal Request and Fraud Chargeback are permitted for deemed-approved transactions after Transaction Credit Confirmation (TCC) updates.
- Reason code 1063 is expanded to cover payment by alternate means and duplicate/multiple transactions.
- Reason code 1085 is described as the user being charged more than the transaction amount.
- Reason code 1084 is discontinued for Chargeback Raise.
- Fraud-representment reason code 131 is expanded to include FIR, NCRP or customer-complaint copies not provided for obtaining debit confirmation.
- New/revised codes cover excess charges, cancelled/returned purchases, defective or not-as-described goods/services, goods/services not received, duplicate/multiple payments, fraud and government-revenue collection payments.
- The evidence table is expressly indicative and stage-/reason-code-specific. Examples include a customer complaint, UPI receipt and purchase bill/invoice for the specified excess-charge deferred-chargeback stage; a purchase invoice with complete breakup and justification for the specified “no excess charges” representment; and FIR/police-complaint or NCRP details, or a customer complaint copy/details raised through a banking channel, for the specified fraud-chargeback stage.
- Certain wrong-payment reversal rejection stages list a bank declaration/follow-up record, customer confirmation, or a customer declaration with a transaction screenshot, depending on the reason.

### Consumer interpretation and limits

The circular changes UPI member-bank and app-provider back-office handling. Customers do not select URCS reason codes themselves. The indicative evidence table is not a universal checklist and does not make every listed document mandatory in every case.

OC 240 does not announce a new customer complaint channel, refund eligibility rule, guaranteed reversal, compensation amount or customer-facing resolution deadline. The Annexure TAT fields are internal workflow data and are not represented as customer service-level commitments.

## Existing OC 241 guide recheck

The existing article npci-upi-p2m-dispute-routing-december-2026 was rechecked on 24 November. Its announcement date remains 4 November and its implementation date remains 23 December 2026. Its listed beneficiary-bank exceptions remain: specified timed-out dispute families, blank Payee PSP field for IFSC/account-number transactions, and NPI (BHIM Services Limited) Payee PSP cases. NPCI's OC 241 text says existing dispute processes, RBI-prescribed TATs, customer compensation and dispute-resolution timelines remain unchanged.

The OC 241 guide now links OC 240 and states that OC 240 is a separate reason-code/evidence update, not a replacement or acceleration of OC 241.

## Website implementation

- Added npci-upi-urcs-dispute-evidence-reason-codes-november-2026 to app/data/research-watch.ts.
- Updated WATCH_CHECKED_AT to 24 November 2026.
- Updated the existing OC 241 item's checked date and added a cross-reference to OC 240.
- The existing ResearchWatchBrief data flow supplies the Research Watch hub, homepage and November bulletin.
- The existing article template generates the new source-linked guide and canonical metadata.
- The existing search-index generator enriches entries from app/data/research-watch.ts.
- The existing app/sitemap.ts includes every Research Watch slug.
- Existing Research navigation already links to Research Watch; no new navigation item is needed.
- No card/fund page or card-ranking formula is changed because this circular does not establish a card or fund product-term change.

## Other findings screened and held

- Research Watch task 6adc4a968f4881919162894e39d400bc is disabled. Its last completed run is 29 October 2026; its recorded Direct Plan default finding remains limited by unavailable original SEBI PDF text and app-by-app implementation evidence.
- SEBI PR 75/2026 and PR 76/2026 pages dated 23 November were identified, but their linked PDFs could not be independently extracted during this check. Detailed claims remain HOLD; no ban, deadline, redressal outcome or other legal effect is inferred.
- RBI’s securitisation amendment directions were reviewed as institutional-market rules, not a direct retail consumer change for this publication.
- NPCI OC 239/2026–27 concerns domestic UPI interchange-fee MCC misclassification, excludes RuPay Credit Card on UPI, and is not treated as a new customer fee or general consumer charge.
- No new D-SIB list change was identified.
- The 24 October batch was re-read in the current repository data and prior issuer/fund sources. IDFC IndiGo, Amex November, the two HDFC schemes, Tata Neu HDFC and SBM ZET remain reconciled; SBM ZET’s effective date remains HOLD.

## Repository and rollback

- Repository: aqdas1820/credonomics-site
- Exact pre-edit main SHA: 5f7d6351503863f45addc4ab2e4dd067f546d274
- Feature branch: editorial/npci-oc240-20261124-0019
- Rollback reference preserving the exact pre-edit main: backup/pre-npci-oc240-20261124-0019

## Validation and release evidence

Validation and production evidence will be appended after the reviewed PR, preview build, merge and production deployment. The existing public-rendering discrepancy from the previous release is still an explicit verification gate: do not describe this article as publicly live until the new article route, Research Watch hub, November bulletin, homepage and primary-source links are independently checked on the custom domain.

## Safeguards

- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources changed.
- No card/fund ranking formulas or reward valuations changed.
- No external messages or comments sent.
- No automation schedules changed. The separate daily 10 AM research report was left untouched.
