# CredoNomics Research Watch — RBI money-mule debit-hold SOP detail correction

## Editorial decision

Correct the existing RBI final KYC Amendment Directions guide in place. This is a material clarification, not a new duplicate article. The original 28 November article relied on the RBI press release because the attached notification bodies had not been extractable in that earlier check. A fresh primary-source review now exposes the detailed final text for four of the six bank-category directions.

## Dates and affected audience

- RBI announcement date: 27 November 2026.
- Independent editorial recheck: 28 November 2026.
- Default commencement: 1 July 2027; each bank may choose an earlier date.
- Detailed timeline coverage in this correction: Commercial Banks, Payment Banks, Local Area Banks and Regional Rural Banks.
- RBI also issued parallel amendments for Small Finance Banks and Urban Co-operative Banks. Their official notification pages are linked, but their detailed bodies were not independently extractable in this check; the detailed timelines are not extended to those two categories.

## Verified final clauses

The following were read in the final RBI notification texts for Commercial Banks (RBI/2026-27/311), Local Area Banks (RBI/2026-27/313), Regional Rural Banks (RBI/2026-27/314) and Payment Banks (RBI/2026-27/316):

1. A bank may place a debit hold on the suspected transaction amount or account only under its high-suspicion assessment or a direction from a competent authority. The internal policy must require a high degree of suspicion, appropriately higher-level approval and avoidance of mechanical account-level holds. Not every suspicious transaction/account is automatically a highly suspicious case.
2. The bank must notify the account holder promptly through digital mode where mobile/email details are on record, otherwise by end of the next working day. The notice must give reasons, removal process, officer contact details and request an explanation/justification with documents, if any, within seven calendar days from the date of the debit hold.
3. The bank must decide within seven calendar days after receiving the explanation: remove the hold if satisfied, or continue and report to the jurisdictional police authority with reasons. If no explanation arrives within seven calendar days after notifying the account holder, the bank continues the hold and reports it with reasons.
4. After police reference, the bank conducts enhanced due diligence. If no legally issued direction specifically requiring continuation is received within 30 calendar days of the reference, the bank removes the hold on day 31 provided it is satisfied with the enhanced due diligence. This is conditional, not an unconditional 31-day cap.
5. The bank must designate nodal officers, publish their details on its website and at branches, acknowledge complaints on receipt and resolve them within 30 calendar days. Specified debit-hold records and correspondence must be retained for five years.
6. The final directions allow banks to review holds placed before the SOP and apply its provisions suitably; they do not promise automatic release of existing holds.

## Draft-versus-final reconciliation

The September 2026 draft's ₹1,000 suspected-transaction threshold, 20-day customer explanation period, 60-day maximum hold and 1 April 2027 proposed start are not presented as final terms. The final default start is 1 July 2027, with earlier implementation permitted at a bank's discretion.

## Primary sources — exact official URLs

- RBI press release 2026-2027/1584, 27 November 2026: https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64062
- RBI Amendment Directions index: https://www.rbi.org.in/Scripts/Fs_AmendmentDirections.aspx
- Commercial Banks KYC Second Amendment Directions (full text checked): https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13763&Mode=0
- Payment Banks KYC Amendment Directions (full text checked): https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13768&Mode=0
- Local Area Banks KYC Second Amendment Directions (full text checked): https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13765&Mode=0
- Regional Rural Banks KYC Second Amendment Directions (full text checked): https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13766&Mode=0
- Small Finance Banks KYC Second Amendment Directions (official page; detailed body not extracted): https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13764&Mode=0
- Urban Co-operative Banks KYC Second Amendment Directions (official page; detailed body not extracted): https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13767&Mode=0
- RBI 11 September 2026 draft text, historical comparison only: https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5170

## Website implementation

- Existing article slug retained: `rbi-final-money-mule-debit-hold-sop-july-2027`.
- Existing article route: https://www.credonomics.in/research/watch/rbi-final-money-mule-debit-hold-sop-july-2027
- Existing data-driven record updated in `app/data/research-watch.ts`.
- Existing shared Research Watch data path feeds the homepage, Research Watch hub, November bulletin and search index; the existing sitemap generator includes Research Watch slugs.
- No card or fund detail page is affected. No ranking formula or reward valuation is changed.
- Public article, hub, homepage, November bulletin, search and sitemap were inspected before editing and returned HTTP 200. The pre-edit public article still carried the earlier caveat that no final customer timelines were asserted.

## Repository baseline and rollback

- Repository: `aqdas1820/credonomics-site`.
- Exact pre-edit main SHA: `b1cdb87a33d109f2dd643e4c8fd72e5985b388de`.
- Rollback branch at that exact SHA: `backup/pre-rbi-money-mule-sop-detail-20261128-1423`.
- Feature branch: `editorial/rbi-money-mule-sop-detail-20261128-1423`.
- Data update commit: `64b61f13f935a34694938992a69701cdd0a9e109`.

## Release validation

Pending PR review, preview build, merge, production deployment and post-release public/source-link checks. This record will be completed with the exact reviewed PR head, merge commit, tests, TypeScript, production build, Vercel READY deployment, public URLs and final main SHA after those checks.

## Safeguards

No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, ranking formulas or automation schedules are changed. No external messages or comments are sent. Research Watch task 6adc4a968f4881919162894e39d400bc remains disabled with its last recorded run on 29 October 2026; the separate daily 10 AM research report remains in its existing disabled state.