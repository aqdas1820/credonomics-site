# Research Watch source-conflict correction — SBM ZET (25 November 2026)

## Review and repository baseline

- Checked: 25 November 2026, 11:22 IST.
- Repository: `aqdas1820/credonomics-site`.
- Exact pre-edit `main` SHA: `45423e1d69103aafc22d5f3ee23b565a9e2e5205`.
- Rollback reference created before edits: `backup/pre-sbm-source-conflict-20261125-1122`.
- Editorial branch: `editorial/sbm-source-conflict-20261125-1122`.
- Existing production deployment before edits: `dpl_GySNypCeYif48A8kbiGA85wGXyYJ`, READY on the pre-edit main SHA.

## Material correction: SBM ZET issuer documents conflict

Existing article:
`/research/watch/sbm-zet-late-fee-october-2026`

Two separate issuer-hosted PDFs currently available from SBM Bank do not agree:

1. Consolidated terms-and-conditions MITC:
   https://www.sbm.bank.in/pdf/terms-conditions/SBM-Secured-Credit-Card-T%26C.pdf
   - PDF page 9, Table No. 08 lists SBM ZET late-payment fees at 5% of Total Outstanding Due, minimum ₹50 and maximum ₹1,000, plus applicable GST.
   - The preceding text says the fee is triggered when the statement outstanding remains past due for more than three days and refers to Payment Due Date +3 days.
   - PDF page 7, Table No. 06 lists a ₹499 cancellation fee within two years from card issuance.
   - PDF page 8, Table No. 07 separately lists 1% eligible rental and education transaction fees effective 15 July 2026.

2. Separate ZET-specific MITC PDF in the issuer's notice-board directory:
   https://www.sbm.bank.in/pdf/notice-board/SBM-ZET-Credit-Card-MITC.pdf
   - Its late-payment table lists a flat ₹299 for SBM ZET and assigns the 5%-of-outstanding (maximum ₹1,000) row to SBM Kredit.Pe.
   - Its cancellation row lists ₹499 if the ZET card is cancelled within one year from activation.

Both documents are issuer-hosted. The accessible copies do not explain which version supersedes the other, provide a revision date that resolves the mismatch, or state an effective date for the ZET late-fee row. The cancellation window also conflicts. The article therefore changes from a definitive 5% description to an explicit **HOLD** on the applicable late-fee amount and cancellation period. It presents both source rows, directs readers to obtain the version and effective date applicable to their card in writing, and does not infer a refund or charge-reversal outcome.

The earlier open PR #168 proposed replacing the 5% row with ₹299 using only the notice-board PDF. It was not merged: that would have presented one conflicting issuer document as conclusive while ignoring the consolidated MITC. No comment or external message was sent.

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
- **SBM ZET:** both issuer PDFs re-read; the late-fee amount and cancellation period are now HOLD because of the document conflict described above. The consolidated MITC's separate 1% rental/education fees effective 15 July 2026 are not described as late fees.

## Other current candidates and duplicate checks

- **ICICI Bank credit-card notices:** the official notice board lists a change effective 25 November 2026 and separate notices for 11 and 15 December. The full notice PDF and exact affected-card rows could not be independently retrieved from the issuer page in this run. Keep the detailed claims HOLD; do not reproduce competitor-only card lists or fees.
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

Public pages inspected before editing:
- https://www.credonomics.in/
- https://www.credonomics.in/research/watch
- https://www.credonomics.in/updates/2026-11
- https://www.credonomics.in/research/watch/sbm-zet-late-fee-october-2026

## Safeguards and automation

- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources changed.
- No card/fund ranking formula, reward valuation or financial-service workflow changed.
- No external messages or comments sent.
- No automation schedules changed.
- Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled; its latest recorded result is 29 October 2026 (SEBI Direct Plan proposal, then HOLD).
- The separate daily 10 AM CredoNomics Daily Research automation remains in its pre-existing disabled state (last run recorded 8 November 2026); it was not re-enabled or rescheduled.
- The separate Publish CredoNomics Research automation remains enabled; its schedule was not changed.

## Release evidence

This file is the pre-merge source and editorial record. Append the reviewed PR/head SHA, preview checks, merge commit, production deployment identity/state, deployed commit match, public-page/source-link verification and any remaining blockers after the release. A READY deployment alone is not proof of public visibility.
