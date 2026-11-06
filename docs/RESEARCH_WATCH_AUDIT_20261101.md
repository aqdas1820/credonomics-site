# CredoNomics Research Watch audit — 1 November 2026

Base `main` at audit start: `b610a3ca0a1fc963d77825b4cb438b88ee38bb4c`.

This is a **non-production research audit**. It does not change payment systems, authentication, card-ranking calculations, financial models, automation schedules, customer data or the unrelated card-design workstream.

## Repository and live-state inspection

- `app/data/research-watch.ts` still has `WATCH_CHECKED_AT = '2026-10-31'`; this was not advanced without a new source-cleared publication.
- `/research/watch` and `/updates/2026-10` still identify 31 October 2026 as the latest Research Watch publication/check period.
- PR #61 (credit-card editorial V2) is already merged into `main`; the handover snapshot calling it a draft is stale.
- Draft PR #62 is the current unrelated credit-card follow-up. It was not modified or merged by this audit.
- No editorial Research Watch PR was open when this audit branch was created.

## Automation state

The handover records Research Watch task `6adc4a968f4881919162894e39d400bc` as paused, publisher `6adcb84822f881918f83e89d6b06120a` as enabled every five hours, and daily report `6adbd4ecb2e48191960ca0a36ac53f91` as enabled for 10 AM IST.

The current scheduler connection could not access those historical task IDs, so their present state could not be independently confirmed here. **No schedule was created, duplicated, resumed or changed.**

## Primary-source checks performed

### PNB — November ATM/CRM and card charges

Official sources checked:
- https://www.pnb.bank.in/Public-Notices.aspx
- https://creditcard.pnb.bank.in/

Current official pages still list the ATM/CRM revision and revised credit-card charges as effective **1 November 2026**. Existing CredoNomics guides already cover both topics.

**Correction needed:** the ATM/CRM guide summary still tells readers to check the cardless-deposit timing “before 1 November”. On 1 November this imperative is stale even though the guide correctly preserves its 30 October check date and the `Upcoming at check` label is intentionally historical. Recommended copy refresh: state that the revised schedule is effective from 1 November and tell readers to check the displayed charge/account exemption before transacting. Do not rewrite the historical publication date.

### Axis Bank — 1 November movie rule and SELECT milestone exclusions

Official source checked:
- https://www.axis.bank.in/cards/credit-card/axis-bank-select-credit-card

The current SELECT page confirms the movie-offer spend requirement effective **1 November 2026** and the existing **1 October 2026** exclusion of insurance, utilities/telecom, gold/jewellery, education, government services, rent, fuel, wallets and gift cards from the relevant ₹3 lakh lounge/Priority Pass and additional-golf spend thresholds.

Dedupe result: **COVERED**. CredoNomics already documents the SELECT milestone exclusions in the October correction ledger and has a Research Watch guide for the 1 November movie-offer rule. No duplicate article is justified.

### American Express India — November platform/benefit changes

Official source checked:
- https://www.americanexpress.com/en-in/support/digital/consumer-experience-updates/

The current Amex page still lists the 15 November platform/benefit changes, MRCC annual-fee-waiver removal, late-fee treatment, supplementary-card pause and service windows. Existing CredoNomics Research Watch coverage already includes these distinctions, including the unresolved restoration-window wording conflict.

Dedupe result: **COVERED**. No new Amex article created.

### SEBI — Direct Plan default statement

Official landing page checked:
- https://www.sebi.gov.in/media-and-notifications/speeches/oct-2026/address-by-chairman-at-ndtv-profit-ignite_105475.html

The SEBI landing page confirms the 28 October Chairman speech exists. The linked original PDF/implementing text could not be reliably examined in this environment, and no separate implementing circular was located that establishes the precise legal scope, transition treatment or whether existing SIPs/regular-plan holdings are affected.

Status: **HOLD**. Do not publish “Direct Plan becomes mandatory” or imply automatic conversion of existing regular-plan holdings/SIPs.

### SEBI — digital-accessibility compliance timeline

Official landing page checked:
- https://www.sebi.gov.in/legal/circulars/oct-2026/extension-of-timeline-with-respect-to-compliance-of-digital-accessibility-circulars_105523.html

The official landing page confirms the 30 October circular and circular identifier. Secondary/exchange reproductions describe an extension to 31 January 2027 for specified audit/remediation steps, but the decisive original PDF could not be rendered and visually inspected in this environment.

Status: **HOLD** under the Research Watch primary-document rule. Do not generalize the extension to every accessibility obligation until the original circular text and covered-entity scope are checked directly.

### Bandhan CRISIL IBX 90:10 SDL Plus Gilt November 2026 Index Fund merger

Discovery source rechecked:
- https://www.valueresearchonline.com/stories/230030/bandhan-crisil-ibx-9010-sdl-plus-gilt-november-2026-index-fund-to-merge-with-bandhan-short-term-fund/

Searches of Bandhan AMC official resources did not surface the required merger addendum/notice establishing the exact scheme identifiers, effective date and exit-window conditions.

Status: **HOLD**. Value Research remains discovery evidence only; do not publish merger/exit rights without the AMC original.

### Jupiter Edge+ CSB Bank RuPay — shopping reward gate

Official/current partner terms checked:
- https://jupiter.money/edge-csb-terms-conditions/
- https://csb.co.in/csb-bank-edge-credit-card

Jupiter's current terms say the updated shopping structure is applicable **10 October 2026 onwards**: 5% Jewels are credited on eligible shopping transactions and the remaining 45% is credited at cycle end only if statement-cycle spend exceeds ₹15,000, subject to the named caps/exclusions. CardAdvisor reports a conflicting issuer-side CSB version using **5 October 2026**. The currently retrievable CSB search result did not expose a current dated document that reconciles the two versions.

Status: **HOLD**. The reward mechanics are material, but the effective-date conflict remains unresolved; do not infer a date or change rankings/calculations from the competitor account.

### NPCI / UPI MDR or merchant-fee change

Official index checked:
- https://www.npci.org.in/circulars/upi

No source-cleared NPCI circular establishing the previously reported MDR/merchant-fee change was located in the current UPI circular index during this audit.

Status: **HOLD**. No conclusion from press/competitor reporting alone.

## Competitor-gap checks

Competitors reviewed for discovery included CardAdvisor, Card Insider, Card Maven, Paisabazaar and Value Research. Findings were reconciled against CredoNomics before escalation:

| Lead / pain point | Competitor signal | CredoNomics result | Official-source result | Action |
|---|---|---|---|---|
| Axis SELECT milestone exclusions | Card Insider / CardAdvisor | Already in October correction ledger | Current Axis page confirms | COVERED / SKIP duplicate |
| Axis November movie eligibility | Card Insider / CardAdvisor | Existing Research Watch guide | Current Axis page confirms effective 1 Nov | COVERED; status copy only if needed |
| Amex November changes | Card Insider | Existing Research Watch guide | Current Amex page confirms | COVERED / SKIP duplicate |
| Jupiter Edge+ ₹15k shopping gate | CardAdvisor | No standalone Watch item found | Partner/issuer-side effective-date conflict unresolved | HOLD |
| Bandhan scheme merger | Value Research | No verified Watch item | AMC original not retrieved | HOLD |
| BOBCARD One late-payment-fee change | CardAdvisor | No verified Watch item found in inspected scope | Current implementing BOBCARD source not retrieved | HOLD / recheck issuer original |
| Axis debit-card benefit revisions | Card Insider | Not cleared as a fresh Watch item in this audit | Requires card-specific Axis original reconciliation | WATCH / HOLD |

Competitor wording, rankings and dates were not copied into CredoNomics factual conclusions.

## Existing-site maintenance findings

1. **PNB ATM/CRM guide — copy correction warranted.** The summary says “before 1 November”; 1 November has arrived and the official notice still states the revised schedule is effective from today. Preserve `publishedAt`/`checkedAt`; refresh only the consumer-facing timing sentence after the exact source is re-read in the publication environment.
2. **Research Watch historical status badges are not a bug.** `watchStatus()` labels an item against `checkedAt`, so “Upcoming at check” is an intentional historical statement. Do not globally change it to present-tense status without rechecking every source.
3. **Expired limited-time entries remain historical snapshots.** For example, the HSBC Live+ Myntra item ended 31 October. Its checked date/status makes the historical context visible; a removal or current-product refresh should be a separate source-backed editorial decision, not an automatic deletion.
4. **No ranking/model changes authorized by this audit.** The current verified-card database intentionally separates source-backed normalized records; no Jupiter/Axis/PNB headline was used to alter numeric rankings.

## Candidate queue after 1 November audit

- **CORRECTION NEEDED — PNB ATM/CRM summary timing:** source confirmed; editorial wording only; preserve historical dates.
- **COVERED — Axis SELECT milestones and November movie rule:** no duplicate publication.
- **COVERED — Amex November changes:** no duplicate publication.
- **HOLD — SEBI Direct Plan default:** implementing scope/original text not fully inspectable.
- **HOLD — SEBI accessibility extension:** original circular PDF not visually inspectable; scope cannot be generalized.
- **HOLD — Bandhan merger:** original AMC addendum not retrieved.
- **HOLD — Jupiter Edge+:** 5 October vs 10 October source conflict unresolved.
- **HOLD — NPCI MDR/merchant fee:** no decisive official circular located.
- **HOLD — BOBCARD One late fee:** competitor lead only until current implementing issuer document is retrieved.

## Release decision

**NO PRODUCTION RELEASE from this audit.** No genuinely new standalone item passed both source verification and dedupe gates. The PNB timing wording is a narrow maintenance correction, but this environment could not safely run the repository test/build workflow because the local container cannot resolve GitHub for a checkout. The existing publisher should apply that one-line editorial correction only after re-reading the exact PNB notice in its normal release environment and then run the repository's standard tests/build/preview gates.

No deployment, merge or production-live claim is made by this audit.
