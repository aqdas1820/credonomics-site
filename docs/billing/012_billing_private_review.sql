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
  amount_paise bigint not null check (amount_paise > 0),
  credited_at timestamptz not null,
  reviewed_by text not null check (length(reviewed_by) between 1 and 200),
  verified_at timestamptz not null,
  evidence_reference text not null check (length(evidence_reference) between 1 and 500),
  created_at timestamptz not null default now()
);
create table if not exists billing_private.audit_events (
  id bigint generated always as identity primary key,
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict,
  event_type text not null,
  actor text not null,
  event_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);
alter table billing_private.invoices enable row level security;
alter table billing_private.invoice_lines enable row level security;
alter table billing_private.bank_credit_evidence enable row level security;
alter table billing_private.audit_events enable row level security;
-- No policies = default-deny to non-owner roles; service-role access requires separate authenticated admin API.
-- IMPORTANT: A controlled server-side transaction must validate sums, lock invoice row,
-- verify evidence independently, and append audit event before changing status.
-- This schema alone does not implement authorization, reconciliation, or immutability.
commit;
