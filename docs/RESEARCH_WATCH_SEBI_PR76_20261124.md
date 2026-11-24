# Research Watch editorial update — SEBI PR 76/2026 investor-scam warning

## Editorial decision

Update the existing SEBI investor-warning guide rather than create a duplicate article. SEBI issued Press Release 76/2026 on 23 November 2026, adding specific red flags and official verification routes to the earlier 22 October 2026 warning about invitation-only WhatsApp stock-tip groups.

The new material is useful to retail investors receiving purported institutional/foreign-market trading invitations, links to unfamiliar apps, or requests to transfer funds to third-party bank accounts. It is an investor advisory, not a new trading rule or refund/compensation entitlement.

## Dates and audience

- Original guide publication: 25 October 2026.
- New SEBI announcement: 23 November 2026.
- Editorial verification: 24 November 2026.
- Effective date: none stated by SEBI.
- Affected audience: retail investors receiving stock tips or purported institutional-trading invitations through private social-media groups, especially where the group directs them to an unfamiliar trading app or a bank account/UPI ID.

## Primary-source verification

1. SEBI Press Release 76/2026, PDF, pages 1–3 for warning/red flags and precautions; page 4 for the 23 November 2026 date:
   https://www.sebi.gov.in/sebi_data/attachdocs/nov-2026/1795442195371.pdf

2. SEBI official press-release page for PR 76/2026:
   https://www.sebi.gov.in/media-and-notifications/press-releases/nov-2026/caution-to-investors-regarding-impersonation-of-sebi-registered-intermediaries-on-closed-user-groups-of-social-media-platforms_105944.html

3. Earlier SEBI Press Release 65/2026, dated 22 October 2026:
   https://www.sebi.gov.in/sebi_data/attachdocs/oct-2026/1792675550417.pdf

4. Earlier SEBI press-release page:
   https://www.sebi.gov.in/media-and-notifications/press-releases/oct-2026/caution-to-investors-against-stock-tips-offered-through-invitation-only-whatsapp-groups_105389.html

5. SEBI Recognised Intermediaries directory:
   https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes

6. SEBI Investor Support, including authorised mobile trading-app information:
   https://investor.sebi.gov.in/Investor-support.html

7. SEBI Check for bank-account details and UPI IDs:
   https://siportal.sebi.gov.in/intermediary/sebi-check

### Verified additions to the existing guide

- PR 76/2026 describes impersonation of SEBI-registered intermediaries in closed social-media groups and inducements to open accounts on unauthorised trading platforms, with funds sent to accounts held by unregistered entities.
- Red flags include unknown invitation links; group-admin numbers with +44, +65 or +91 codes (not proof by themselves); claims about recovering Indian portfolio losses through foreign markets; off-market negotiated block trades; institutional-trading pitches; fake institutional accounts; third-party bank accounts; fake apps displaying supposed balances/portfolios; misuse of SEBI registration screenshots; fake SEBI letterheads/stamps; false claims of SEBI-employee connections; and fresh invitations after group suspension.
- SEBI's stated checks are the Recognised Intermediaries directory, authorised mobile-app information linked from Investor Support, and SEBI Check for bank-account details/UPI IDs. SEBI also advises checking the Play Store verified badge; the article directs readers to the official authorised-app information as an independent cross-check.
- The new release expressly refers to the earlier 22 October warning, so the existing article was updated rather than duplicated.
- The registration directory displayed data updated 20 November 2026 when checked on 24 November.

### Limits retained

This is an investor advisory, not a new trading prohibition, a finding against every private group, or a guarantee that a registration/app/bank-account lookup detects every impersonation attempt. A phone-number prefix is not proof by itself. No refund eligibility, recovery process, compensation entitlement or guaranteed investment outcome is inferred.

## Other candidates kept on HOLD

- SEBI PR 75/2026 on unregulated pre-listing premium/GMP: the official HTML page and date/PR number were verified, but the linked PDF body was not retrievable in the research session. No substantive claims were published from the title alone.
- Union Mutual Fund merger and Axis Mutual Fund subscription restrictions: exchange-notice summaries were visible, but the complete current AMC addenda/affected-scheme annexures could not be independently retrieved. No scheme-specific action was published.
- ICICI credit-card charges PDF: current official Notice Board indicates a 25 November update, but the detailed issuer PDF returned an access error in this check. Existing coverage was not expanded from secondary summaries.

## Website implementation

- Updated the existing `sebi-whatsapp-stock-tips-verification-checklist` entry in `app/data/research-watch.ts`.
- Preserved the original publication date (25 October), set the latest check to 24 November, and separated the new announcement date (23 November) from the original publication date.
- Kept the existing slug; no duplicate article was created.
- The existing data-driven components supply the Research Watch hub, homepage and November bulletin. The current search-index generator adds Research Watch items automatically, and `app/sitemap.ts` adds every Research Watch slug. Existing Research navigation already links to the hub.
- No card/fund page or ranking formula applies to this investor-warning update.
- `WATCH_CHECKED_AT` was already 24 November 2026 and did not need modification.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `4482b6e1bcd79e8283d945e46013e97cda490389`
- Rollback branch: `backup/pre-sebi-pr76-20261124-1022`
- Feature branch: `editorial/sebi-pr76-investor-warning-20261124-1022`
- Content commit: `14cfa527e5878cf9addbe628cd381f4fc5995f7e`
- PR and deployment validation: pending at initial record creation.

## Scope safeguards

No card/fund data, card-ranking formulas, reward valuations, payments, authentication, customer/financial records, infrastructure, secrets or paid resources were changed. No external messages or comments were sent. No automation schedules were changed.
