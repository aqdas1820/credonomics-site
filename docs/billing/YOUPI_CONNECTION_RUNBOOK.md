# CredoNomics × YouPI connection — operator runbook

## What is implemented

An independent, strict server-to-server adapter for the real YouPI-PG v2 API contract, using `POST /api/v1/payments` and `GET /api/v1/health`. The checkout URL is verified against a separately configured allowed origin, order ID, exact INR paise, payment UUID and currency. The application never derives payment amount or merchant from customer query parameters. A deterministic idempotency key is supplied, but upstream implementation may rewrite retry order IDs, so such a mismatch is rejected.

- `GET /api/youpi/admin/health`: requires independently authenticated, allowlisted billing admin and explicit `YOUPI_BRIDGE_ENABLED=true`. Read-only network check.
- `POST /api/youpi/admin/invoices/{id}/session`: requires admin login, same-origin request, `BILLING_API_ENABLED=true`, confirmed private database scope, and **all** of `YOUPI_BRIDGE_ENABLED`, `YOUPI_SESSION_CREATION_APPROVED`, `YOUPI_LICENSE_CONFIRMED`, `YOUPI_SECURITY_REVIEW_APPROVED` set to exactly `true`. Reads canonical UNPAID invoice from server-only `billing_get_invoice`; calls YouPI for a payment session only when preconditions pass. **Do not set these gates true without independent owner approval and supporting evidence.**
- `verifyYoupiWebhook`: raw-body HMAC validation function only. **No webhook handler is installed** because the upstream retry/replay defects and missing durable inbox are unresolved.
- This integration does **not** create public customer invoice links, initiate payments on its own, mark PAID, verify bank settlement, issue receipts or send email/WhatsApp.

## Current upstream facts

Canonical upstream: https://github.com/youpi-pg/YouPI-PG (checked 2026-10-19), API contract `openapi.yaml`; inspected implementation `apps/payment-api/src/routes/payments.routes.js` at `91d543c251f381a47bd57cd23695912bd873e492`. The README explicitly describes **experimental/research** use and does not claim production certification. GitHub root has no LICENSE file and commercial deployment rights have not been established. The current issue tracker contains material payment attribution, webhook delivery/replay, status, admin/auth and OTP findings. Do not infer rights or safety from the repo being public.

## First live connection test on the owner's Windows PC

From a checkout that includes `scripts/check-youpi-local.mjs`:

```powershell
node scripts/check-youpi-local.mjs
```

Expected after launching the actual YouPI services:

```text
YouPI payment API: PASS
YouPI checkout port 7000: PASS
READ-ONLY: no payment initiated or settled
```

If not running, inspect the actual upstream checkout installation (Node 20+), and start it on the local PC according to its own instructions. The payment API normally binds `127.0.0.1:6100`, checkout portal `127.0.0.1:7000`. **Do not copy .env secrets, publicize the local admin panel, open firewall ports, deploy a public tunnel, or change banking settings.** A local probe only verifies loopback runtime connectivity, not customer accessibility.

The website's cloud-hosted Vercel function **cannot reach the owner's localhost**. Hosted API integration would require an approved secure network-reachable YouPI deployment and a separately validated HTTPS checkout host. No paid resource is provisioned here.

## Server-only settings (disabled unless owner-approved)

```text
YOUPI_API_ORIGIN=https://<owner-verified-api-host>
YOUPI_CHECKOUT_ORIGIN=https://<owner-verified-checkout-host>
YOUPI_MERCHANT_ID=<independently verified merchant UUID>
YOUPI_BRIDGE_ENABLED=false
YOUPI_SESSION_CREATION_APPROVED=false
YOUPI_LICENSE_CONFIRMED=false
YOUPI_SECURITY_REVIEW_APPROVED=false
```

HTTPS origin must have no path, credentials, query or fragment. Local testing of this adapter allows loopback HTTP only in a non-production, non-Vercel, non-Railway process with `YOUPI_ALLOW_LOCAL=true`; production refuses loopback and literal private IPs. Never put secrets or receiving account details in `NEXT_PUBLIC_*` variables.

## Validation and release gates

Unit fixtures: `npm test -- src/lib/billing/youpi-contract.test.ts`. Next.js regression: `npm run typecheck`, `npm run build`, admin unauthorized denials. The local connectivity command is strictly read-only. The suite uses synthetic upstream HTTP fixtures and never initiates a real payment.

**Required before any customer link or real-money activation:** verifiable permission to use YouPI commercially, upstream security remediation, hosted HTTPS reachable gateway with verified beneficiary/merchant identity and bank receiving account, approved authentication/OTP, durable signed and replay-safe webhook inbox with retries, official bank-credit reconciliation independent of SMS/Gmail/YouPI success, private invoice-link design, confirmed lawful business/issuer terms, delivery channels and recurring zero-cost feasibility. Green unit tests alone do not satisfy these gates.
