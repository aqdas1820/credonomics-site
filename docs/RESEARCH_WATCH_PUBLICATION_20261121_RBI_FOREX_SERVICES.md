# Research Watch release evidence — RBI foreign-service reporting clarification

**Editorial check:** 21 November 2026  
**RBI FAQ publication date:** 20 November 2026  
**Underlying Regulations notified:** 13 January 2026  
**Underlying Regulations effective:** 1 October 2026  
**Second Amendment date:** 2 November 2026  
**Second Amendment effective date:** 1 October 2026

## Published record

- **Article slug:** `rbi-forex-service-reporting-resident-individuals-november-2026`
- **Intended public URL:** https://www.credonomics.in/research/watch/rbi-forex-service-reporting-resident-individuals-november-2026
- **Affected audience:** FEMA-resident natural persons receiving overseas payments for services or paying overseas providers for services, and non-individual service exporters/importers whose relevant inward remittance or invoice/contract value is near ₹10 lakh.
- **Scope:** service exports/imports and software reporting. This is not a general relaxation for goods trade, a tax exemption, a general LRS change, or a waiver of bank KYC and transaction-genuineness checks.

## Verified editorial points

1. A FEMA-resident natural person exporting services is deemed to have submitted the Export Declaration Form (EDF) when the required service-payment details are provided to the authorised dealer (AD) bank for inward-remittance credit; a separate EDF is not required for that resident-individual service export.
2. For non-individual service exporters, the ₹10 lakh test applies to each inward remittance. Above that threshold, EDF must be filed before credit, subject to the timelines described in the RBI FAQ.
3. For service imports, the ₹10 lakh test is based on invoice/contract value. The amended IDPMS service-import detail entry applies to an importer other than a resident individual where that value exceeds ₹10 lakh.
4. AD banks continue to verify transaction genuineness and report inward/outward remittance details in E/IDPMS. Banks may request transaction-specific information under their published trade policy and SOP.
5. Transactions undertaken before 1 October 2026 remain under the earlier framework even if completed or paid later.
6. For non-individual software exporters in the Domestic Tariff Area, SOFTEX was discontinued from 1 October 2026; the applicable EDF route differs for DTA and SEZ exporters.

## Primary sources

- RBI FAQ dated 20 November 2026: https://rbi.org.in/scripts/FAQDisplay.aspx?Id=181
- RBI Second Amendment Regulations dated 2 November 2026, effective 1 October 2026: https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13750&Mode=0
- RBI consolidated Foreign Exchange Management (Export and Import of Goods and Services) Regulations, 2026, amended through 2 November: https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13277&Mode=0

## Repository and release trace

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `15f2c7854a08d08df63fa10524c5bb3b093f65db`
- Rollback branch preserving that exact SHA: `backup/pre-rbi-forex-faq-20261121-1224`
- Feature branch: `editorial/rbi-forex-service-faq-20261121-1224`
- Content PR: https://github.com/aqdas1820/credonomics-site/pull/142
- Content commit / post-merge main SHA at content release: `8a9e9447bd2cd2d5456af531a2676fc1ba578fe2`
- Pre-evidence rollback branch preserving the content-release main SHA: `backup/pre-rbi-forex-release-evidence-20261121-1224`

## Validation

Final preview deployment:
- Deployment: `dpl_Aa4TByUDGx2zgPmsaGPNWVbBxdHg`
- Status: READY
- Commit: `b29c428134a68553329481c691971d9f1ff7375a`
- Unit tests: 177 passed across 29 test files
- Standalone TypeScript: `tsc --noEmit --pretty false` passed
- IPO dashboard generation: 41 records
- Search index generation: 141 entries
- Next.js production build: completed; 344 static pages generated

Production content deployment:
- Deployment: `dpl_698H14DQQdF2r9mFaePaki9Dfd4h`
- Status: READY
- Target: production
- Deployed commit: `8a9e9447bd2cd2d5456af531a2676fc1ba578fe2`
- Vercel project: `prj_NXyFJfuc7NwEmp5ws9CASP33Ybg0`
- Production aliases assigned by Vercel: `www.credonomics.in`, `credonomics.in`

## Public verification limitation

**Public visibility is not confirmed as of 21 November 2026.**

- The expected article URL returned Internal Error from the public web checker.
- The Research Watch hub still rendered the previous 20 November snapshot and did not show the new record.
- The November bulletin showed a 21 November latest-check label but its visible cards still began with the prior 20 November entries.
- The homepage Research Watch cards also showed the prior snapshot.
- Public search and sitemap fetches were unavailable.
- Vercel reports the production deployment READY and assigns both custom-domain aliases, but those deployment facts do not substitute for a successful public-page fetch.

The article is present in the merged repository data and the production build completed. Do **not** describe public visibility as independently verified until the article, hub, bulletin, search result and sitemap can be fetched from the public domain. No cache, DNS, infrastructure, or paid-resource changes were made to work around this verification limitation.

## Safeguards

- No card-ranking formulas or reward valuations changed.
- Payments, authentication, customer/financial records, infrastructure, secrets and paid resources were not changed.
- No external messages or comments were sent.
- Automation schedules were not changed. Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled with its last recorded run on 29 October 2026. The separate daily 10 AM CredoNomics Daily Research task was already disabled and was left unchanged.
