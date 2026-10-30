# PNB ATM/CRM schedule — 30 October 2026

Pre-release main: `a2b9d5a22551e94002e4870845a2fd1e310808d5`.
Rollback: `backup/pre-pnb-atm-crm-20261030` at that exact SHA.

## Selection and independent verification

Read matching daily research run/result `f8fa97d5-ef5c-832b-ae29-d2afd1de8797`; PNB ATM/CRM candidate was HOLD for missing original table. Latest Watch run/result remains `09efef09-7764-832e-9a86-35b7afb2b579`; no newer recorded output. Preserve both task settings and daily report.

Exact official source: https://www.pnb.bank.in/Public-Notices.aspx . Listing published 25 September 2026 at 4:40 pm, effective 1 November, title “Revision in ATM/CRM service charges w.e.f. 01.11.2026”, filename `NoticeDoc2026-09-25_114354903.pdf`, display filename `Revised Service Charges.pdf`.

Inspected public HTML: download is an ASP.NET postback, not an ordinary direct PDF URL. Followed its observed download event with freshly obtained public hidden fields and cookies (no authentication/customer data); response was HTTP 200 application/pdf, 401,963 bytes, at the same exact public-notice URL. Extracted both pages and visually inspected the complete tables. Do not invent a static PDF address; link the verified index with exact click instructions, title and filename.

Section A: five successful financial transactions/month free for savings/current accounts on PNB machines, then ₹20 plus applicable taxes, own-machine non-financial transactions free; section-specific exemptions. Section E: cardless CRM deposit into PNB savings, nil 10 am–4 pm business hours, ₹25 plus GST outside, listed 4:01 pm–9:59 am and holidays wording. Do not infer daytime holiday treatment or extend section A exemptions into E. Sections B/C/D/F expressly unchanged: other-bank transactions and failed withdrawals are not universally free. No old-to-new comparison unsupported by a predecessor schedule. No refund process/eligibility inferred.

Current main initial batch, PNB credit-card guide, Axis update, latest RBI records, monthly bulletin and current public Watch/bulletin inspected. No ATM/CRM guide duplicate. Fresh RBI index adds market operations/underwriting, no selected retail-action update. SEBI original speech previously retrieved, implementing confirmation still unestablished: keep binding-rule claim HOLD. Search-index cache lag for the Axis expansion is not a factual correction. Preserve all previous publication snapshots.

## Integration and publication record

Established data-driven guide flows to homepage, Cards, Research, Watch, bulletin, search and sitemap. No matching normalized debit-card detail exists. Latest publication date already 30 October; no static date change needed. No rankings, payments, authentication, customer/financial records, infrastructure, secrets, paid resources, schedule or daily-report changes.

Release PR titled “Publish PNB ATM and CRM November charge guide” records exact intended head/tested tree, checks, preview and production READY/deployed commit, public-page and source verification. This note and the PR form publication evidence.

Validation PASS: 143 tests/23 files, production build, post-build TypeScript and diff check. Rendered-text checks verify announcement/publication/check/effective dates, upcoming status, amounts/hours/exemptions/limitations and exact source/download instructions; homepage/Cards/Research/Watch/bulletin single-entry inclusion, irrelevant-category exclusion, generated search and sitemap pass. Data-only release; existing unrelated build/lint/cache warnings retained. Verified original PDF SHA-256: `00583b3bdc3d4d0d1a1ca4cb915f1ea6ed68be5fc4ef68cc50a8cb0225c888f7`.
