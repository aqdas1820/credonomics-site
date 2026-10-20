# CredoNomics Billing v1 — Phase 12 integration specification

Status: development-only. No production payments.

## Upstream selection
- Invoify: https://github.com/al1abb/invoify (MIT, copyright 2023 Ali Abbasov).
- Preserve upstream copyright and license notices for reused code.
- CredoNomics is Next.js 14 / React 18; upstream currently Next.js 15. Do not overwrite package.json or install wholesale.
- Reuse invoice form, validation and PDF-template concepts/components only after compatibility and dependency review.

## MVP
1. Authenticated admin creates a draft invoice with customer, item descriptions, quantities, rates, tax fields (when applicable), invoice date, due date, and terms.
2. Validate amount calculations server-side and generate unique immutable invoice identity.
3. Produce downloadable UNPAID PDF with CredoNomics branding and original invoice data.
4. Persist invoices securely; no production invoice data in browser-only localStorage or ephemeral Vercel filesystem.
5. Authorized admin enters Slice booked-credit evidence (amount, UTR, date); reject duplicate UTR and discrepancies; keep audit log.
6. Only after verified full credit, create a versioned PAID PDF and receipt automatically. Preserve original UNPAID PDF. Support partial payments.
7. Customer invoice lookup is disabled until real WhatsApp OTP is verified and fail-closed. No mock OTP in public preview.
8. Do not create UPI QR, intent, payment session, checkout, public admin/gateway endpoint or live collection.

## Test gates
- Invoice arithmetic and INR formatting; zero/negative/overflow cases.
- Duplicate invoice identity, concurrent number generation, input escaping.
- Unauthorized admin/customer access and IDOR.
- Unpaid PDF must never show PAID.
- Mock YouPI SUCCESS must never mark paid.
- Slice evidence must be checked before PAID; duplicate UTR blocked.
- Browser/PDF layout visual regression against sample Khatabook invoice.
- Build, typecheck, unit tests and smoke tests before preview release.

## Constraints
Strict ₹0; no provisioning, paid plans or paid API calls. Draft branch feature/youpi-payment-entry-prelaunch only. Never merge main. Production unchanged.
