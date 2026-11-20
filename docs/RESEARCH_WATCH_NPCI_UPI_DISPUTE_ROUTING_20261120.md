# CredoNomics Research Watch — NPCI UPI merchant-dispute routing

## Editorial review

- Checked: 20 November 2026
- Circular date / announcement date: 4 November 2026
- Implementation date: 23 December 2026
- Affected audience: UPI users making person-to-merchant (P2M) payments who may later need to raise a dispute.
- Official primary source: https://www.npci.org.in/uploads/UPI_URCS_OC_241_Revision_of_dispute_routing_logic_for_UPI_P2_M_transactions_in_URCS_1c6c076393.pdf
- Exact source: NPCI/UPI/OC No. 241/2026–27, pages 1–3 and Annexures I–II.

## Verified scope

From 23 December 2026, applicable P2M disputes in URCS are routed to the Payee PSP bank instead of the Beneficiary Bank across two-party, three-party and four-party transaction models. NPCI says the revised routing is also implemented in UDIR and MyUPI.

The beneficiary bank continues to receive the listed timed-out categories: Deferred Chargeback (reason code 121), Chargeback (reason code 108), Online Refunds, Negative Good Faith Chargeback, TCC and Complaint Raise. Additional exceptions apply where the Payee PSP field is blank for IFSC-and-account-number-based transactions or where the Payee PSP is NPI (BHIM Services Limited).

NPCI expressly says existing dispute processes, rules, timelines, RBI-prescribed TATs, customer compensation and dispute-resolution timelines remain unchanged. Disputes and adjustments raised before 23 December remain under the existing routing. No new consumer complaint channel, refund eligibility, refund process or compensation amount is inferred.

## Deduplication and integration

- Current main data source re-read at base SHA `7f5fbb3533f21a43b5b6a5c363ae37a761b80703`; no existing NPCI OC 241 / P2M dispute-routing item was present.
- Existing Research Watch hub and November bulletin were inspected. Existing data-driven `researchWatch` feed drives the article route, hub, homepage brief, monthly bulletin, search index and sitemap.
- No card or fund detail page is relevant. No card ranking, reward valuation or other financial model is changed.
- The original 24 October findings were re-read in the current data and source records: IDFC IndiGo international rewards, Amex November changes, HDFC Balanced Advantage / Children’s Fund exit window, Tata Neu HDFC manual claims, and SBM ZET fees. No duplicate update was added. SBM ZET’s late-fee formula remains confirmed while its effective date remains HOLD.

## Scope safeguards

No payments, authentication, customer/financial records, infrastructure, secrets, paid resources or automation schedules are changed. No external messages or comments are sent. The Research Watch task and separate daily 10 AM report are left in their existing states.

## Base and rollback

- Exact pre-edit main SHA: `7f5fbb3533f21a43b5b6a5c363ae37a761b80703`
- Rollback branch: `backup/pre-npci-upi-dispute-routing-20261120-0651`
- Feature branch: `editorial/npci-upi-dispute-routing-20261120-0651`

## Validation evidence

- Unit tests: `177 passed` across `29 test files`, run through the existing Vercel preview build's temporary validation-only `prebuild` command.
- Standalone TypeScript: `npm run typecheck` passed (`tsc --noEmit --pretty false`).
- Production build: `next build` completed successfully on Next.js 15.5.28.
- Search index: `137` entries generated, including the new Research Watch item.
- Static route generation: `/research/watch/npci-upi-p2m-dispute-routing-december-2026`, the Research Watch hub, November bulletin and `/sitemap.xml` were included in the build output.
- Validation-only branch: `verify/npci-upi-dispute-routing-20261120-0651`, commit `a69a13d57ccd3a856c85dcfc3d6cd2d3ef1a8817`. Its temporary `package.json` prebuild change runs tests and typecheck before the normal generators; this validation-only change is not on the feature branch and will not be merged.
- Vercel validation preview: [READY](https://vercel.com/aqdasshaikh1820-9566s-projects/credonomics-site/HsWDDNyNsjd4qBPPf6mpQFCXBYzT), deployment `dpl_HsWDDNyNsjd4qBPPf6mpQFCXBYzT`.

## Release evidence

PR review, merge and production deployment are pending. After merge, record the exact merged commit, Vercel production deployment ID/status, public route checks and source-link verification before describing the article as live.
