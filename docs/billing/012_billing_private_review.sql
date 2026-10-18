-- CredoNomics Billing v1: REVIEW-ONLY SQL. DO NOT EXECUTE WITHOUT APPROVAL.
-- Dedicated private schema, no public API grants. Apply with a controlled service role only.
begin;
create schema if not exists billing_private;
revoke all on schema billing_private from public, anon, authenticated;

create table if not exists billing_private.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique check (length(invoice_number) between 1 and 40),
  customer_name text not null check (length(customer_name) between 1 and 120),
  customer_phone_e164 text,
  customer_address text not null default '' check (length(customer_address) <= 300),
  issued_on date not null,
  currency text not null default 'INR' check (currency = 'INR'),
  total_paise bigint not null check (total_paise > 0 and total_paise <= 10000000000),
  status text not null default 'UNPAID' check (status in ('UNPAID','PARTIAL','PAID','VOID')),
  origin text not null default 'ADMIN' check (origin in ('ADMIN','SYSTEM')),
  source_event_key text unique check (source_event_key is null or length(source_event_key) between 8 and 128),
  check ((origin='ADMIN' and source_event_key is null) or (origin='SYSTEM' and source_event_key is not null)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists billing_private.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict,
  position integer not null check (position >= 0),
  description text not null check (length(description) between 1 and 300),
  quantity integer not null check (quantity > 0),
  rate_paise bigint not null check (rate_paise >= 0),
  line_total_paise bigint not null check (line_total_paise >= 0),
  unique(invoice_id,position)
);
create table if not exists billing_private.bank_credit_evidence (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict,
  bank_name text not null default 'Slice' check (bank_name = 'Slice'),
  utr text not null unique check (length(utr) between 8 and 80),
  amount_paise bigint not null check (amount_paise > 0 and amount_paise <= 10000000000),
  credited_at timestamptz not null,
  reviewed_by text not null check (length(reviewed_by) between 1 and 200),
  verified_at timestamptz not null,
  evidence_reference text not null check (length(evidence_reference) between 1 and 500),
  created_at timestamptz not null default now()
);
-- A PAID receipt is created exactly once, inside the same bank-settlement
-- transaction that first verifies the invoice is fully credited.
-- This row is a versioned source snapshot; PDF binary archival is separate.
create table if not exists billing_private.receipts (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null unique references billing_private.invoices(id) on delete restrict,
  receipt_number text not null unique check (length(receipt_number) between 8 and 60),
  version integer not null default 1 check (version = 1),
  issued_at timestamptz not null default now(),
  issued_by uuid not null,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now()
);

create or replace function billing_private.reject_receipt_mutation()
returns trigger language plpgsql set search_path = pg_catalog
as $$
begin
  raise exception 'Verified receipt snapshots are append-only';
end;
$$;
drop trigger if exists immutable_verified_receipt on billing_private.receipts;
create trigger immutable_verified_receipt
before update or delete on billing_private.receipts
for each row execute function billing_private.reject_receipt_mutation();

create table if not exists billing_private.audit_events (
  id bigint generated always as identity primary key,
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict,
  event_type text not null,
  actor text not null,
  event_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);
-- Preserve issued line items, booked-credit evidence and the audit trail.
-- Even service-role updates/deletes must fail; corrections require separately
-- designed compensating entries instead of overwriting historical records.
create or replace function billing_private.reject_financial_evidence_mutation()
returns trigger language plpgsql set search_path = pg_catalog
as $
begin
  raise exception 'Billing financial evidence is append-only';
end;
$;
drop trigger if exists immutable_invoice_line on billing_private.invoice_lines;
create trigger immutable_invoice_line
before update or delete on billing_private.invoice_lines
for each row execute function billing_private.reject_financial_evidence_mutation();
drop trigger if exists immutable_bank_credit on billing_private.bank_credit_evidence;
create trigger immutable_bank_credit
before update or delete on billing_private.bank_credit_evidence
for each row execute function billing_private.reject_financial_evidence_mutation();
drop trigger if exists immutable_billing_audit on billing_private.audit_events;
create trigger immutable_billing_audit
before update or delete on billing_private.audit_events
for each row execute function billing_private.reject_financial_evidence_mutation();

-- Original issued invoice identity and customer/line financial facts are write-once.
-- Reconciliation may update ONLY status and updated_at on the invoice header;
-- the underlying original issuance must never be silently rewritten.
create or replace function billing_private.preserve_invoice_issuance_fields()
returns trigger language plpgsql set search_path = pg_catalog
as $
begin
  if row(new.id, new.invoice_number, new.customer_name,
         new.customer_phone_e164, new.customer_address, new.issued_on,
         new.currency, new.total_paise, new.origin, new.source_event_key,
         new.created_at)
     is distinct from
     row(old.id, old.invoice_number, old.customer_name,
         old.customer_phone_e164, old.customer_address, old.issued_on,
         old.currency, old.total_paise, old.origin, old.source_event_key,
         old.created_at) then
    raise exception 'Issued invoice details cannot be rewritten';
  end if;
  return new;
end;
$;
drop trigger if exists immutable_invoice_issuance on billing_private.invoices;
create trigger immutable_invoice_issuance
before update on billing_private.invoices
for each row execute function billing_private.preserve_invoice_issuance_fields();

alter table billing_private.invoices enable row level security;
alter table billing_private.invoice_lines enable row level security;
alter table billing_private.bank_credit_evidence enable row level security;
alter table billing_private.receipts enable row level security;
alter table billing_private.audit_events enable row level security;
-- No policies = default-deny to non-owner roles; service-role access requires separate authenticated admin API.
-- IMPORTANT: A controlled server-side transaction must validate sums, lock invoice row,
-- verify evidence independently, and append audit event before changing status.
-- This schema alone does not implement authorization, reconciliation, or immutability.
commit;
