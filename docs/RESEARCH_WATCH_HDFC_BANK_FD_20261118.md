# HDFC Bank retail FD rate schedule · 18 November 2026

Base main: `ba106d5f4bb550a10a4ed751d167394eb543b55a`.
Rollback reference: `backup/pre-hdfc-bank-fd-rates-20261118`.
Feature branch: `editorial/hdfc-bank-fd-rates-20261118`.

## Selection and evidence

The official HDFC Bank rate page was checked on 18 November 2026. Its Domestic / NRO / NRE table for deposits below ₹3 crore is marked effective from 4 November 2026. The page does not separately state the announcement date. It lists a 6.60% p.a. top rate for general customers and 7.20% p.a. for eligible resident senior citizens on 3 years 1 day to 5 years. The senior rate is not available to NRIs; the page specifies a one-year minimum for NRE deposits.

[HDFC Bank official FD interest-rate page](https://www.hdfc.bank.in/fixed-deposit/fd-interest-rate)

The guide keeps the under-₹3 crore table separate from higher deposit bands, distinguishes the checked and effective dates, and directs readers to confirm the rate on the value date. It does not estimate maturity values or post-tax returns.

## Deduplication and implementation

The current production Research Watch, November bulletin, homepage, relevant card/fund pages and current `main` were inspected. No existing HDFC Bank retail FD guide or duplicate Watch item was found. The 24 October initial-batch records were re-read: IDFC IndiGo international rewards remains a separate product-specific rule; Amex’s November guide now includes the 15 November MITC and service updates; the HDFC Balanced Advantage / Children’s Fund exit window is marked closed; Tata Neu manual claims remain upcoming for 25 November; and the SBM ZET fee entry remains product-specific. No ranking formulas or financial product data were changed.

The Watch article data drives the homepage, Research Watch hub, November bulletin and sitemap. The generated search index receives a matching entry. No navigation change is needed because the existing Research and November bulletin links are data-driven and already present.

## Scope

Editorial content only. Payments, authentication, customer/financial records, infrastructure, secrets, paid resources and automation schedules are untouched. No external messages or comments were sent.
