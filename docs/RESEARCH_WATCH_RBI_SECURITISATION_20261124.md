# Research Watch publication record — RBI securitisation-note amendments

## Editorial decision

Publish a narrowly scoped Markets update on the final Reserve Bank of India securitisation-transaction amendments issued on 23 November 2026 for commercial banks, small finance banks, NBFCs and All India Financial Institutions. The change is relevant to existing and prospective holders of securitisation notes because it adds dematerialised holding and a minimum ticket size at subsequent transfers, while also applying to transactions in notes issued before the commencement date.

This is not a general retail-deposit or borrower-loan change. The article does not imply a new ₹1 crore issuance minimum: that minimum was already present in the 2025 Directions. It does not infer a forced sale for existing holdings below ₹1 crore, an automatic borrower EMI change, or deposit insurance.

## Dates and affected audience

- Announcement: 23 November 2026.
- Editorial check/publication: 24 November 2026.
- Final commencement: 1 April 2027.
- Affected audience: existing or prospective investors in securitisation notes issued under RBI directions for commercial banks, small finance banks, NBFCs/HFCs and AIFIs; issuers, SPEs, trustees and depositories.
- The 1 October 2026 date in the July draft is superseded by the final 1 April 2027 date.

## Primary-source verification and reconciliation

1. RBI press release 2026-2027/1550, dated 23 November 2026:
   https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64028

2. RBI final Amendment Directions for Commercial Banks, 23 November 2026:
   https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13753&Mode=0

3. RBI final Amendment Directions for Small Finance Banks, 23 November 2026:
   https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13754&Mode=0

4. RBI final Amendment Directions for NBFCs, 23 November 2026:
   https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13755&Mode=0

5. RBI final Amendment Directions for All India Financial Institutions, 23 November 2026:
   https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13756&Mode=0

6. RBI 2025 Commercial Banks Securitisation Transactions Directions:
   https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=13150

7. RBI 2025 Small Finance Banks Securitisation Transactions Directions:
   https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=13118

8. RBI 2025 NBFC Securitisation Transactions Directions, updated 1 July 2026:
   https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12951

9. RBI 2025 All India Financial Institutions Securitisation Transactions Directions:
   https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12976

10. RBI July 2026 draft amendment:
    https://rbi.org.in/scripts/bs_viewcontent.aspx?Id=5124

### What changed

- All four final directions take effect on 1 April 2027.
- Final replacement paragraphs require issuance, holding and subsequent transfer of securitisation notes only in dematerialised form.
- The minimum ticket size is ₹1 crore per single investor at issuance and any subsequent transfer.
- The ₹1 crore issuance minimum already existed in the 2025 directions for the relevant categories. The new material extension is the minimum at subsequent transfers and dematerialised holding.
- Notes with amortisation structures may be traded at amortised value if the ticket size falls below ₹1 crore. This is a limited exception, not a general below-₹1 crore waiver.
- New paragraph 28A/27A applies the requirements to transactions in notes issued before 1 April 2027 as well.
- Public offers must comply with Regulation 21 of the SEBI (Issue and Listing of Securitised Debt Instruments and Security Receipts) Regulations, 2008, as amended.
- The July 2026 draft proposed 1 October 2026. The final directions after feedback set 1 April 2027; only the final date is used.
- The 2025 RBI directions state that securitisation notes are not insured and do not represent deposit liabilities of the originator, servicer or trustee.
- The directions govern securitisation notes, not the underlying borrower's loan agreement, EMI, interest rate or repayment schedule.

### Legacy-holding limitation

The final text expressly brings transactions in notes issued before 1 April 2027 under the new requirements from that date. It does not separately explain whether an existing holding below ₹1 crore may continue to be held without transfer, and it does not state that such a holder must forcibly sell. The article asks holders to obtain issuer/trustee/depository guidance and does not infer either a forced sale or a blanket exemption.

## Website implementation

- Add one source-backed WatchItem to `app/data/research-watch.ts`.
- Use separate announcement (23 November), checked/publication (24 November) and final-effective (1 April 2027) dates.
- The existing ResearchWatchBrief feeds the Research Watch hub, homepage and November bulletin.
- The existing article route is data-driven at `/research/watch/[slug]`.
- The existing prebuild search-index generator reads Research Watch entries; `app/sitemap.ts` imports the same data and adds each article URL.
- Existing Research navigation already links to Research Watch; no navigation change is needed.
- No card or fund page is directly affected; no card ranking, reward valuation or formula is changed.
- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources are changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `30cf3da1e269f88db6ff558c8f93c83a23e17482`
- Rollback branch: `backup/pre-rbi-securitisation-notes-20261124-1119`
- Feature branch: `editorial/rbi-securitisation-notes-20261124-1119`
- Editorial check: 24 November 2026.

## Final release evidence

Pending PR review, test/typecheck/build validation, merge, production deployment and public-page/source-link verification. This section must be completed only from observed results.
