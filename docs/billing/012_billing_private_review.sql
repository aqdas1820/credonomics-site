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
alter table billing_private.invoices enable row level security;
alter table billing_private.invoice_lines enable row level security;
alter table billing_private.bank_credit_evidence enable row level security;
alter table billing_private.receipts enable row level security;
alter table billing_private.audit_events enable row level security;
-- Runtime roles have RPC access only, never direct private-table writes.
revoke all on all tables in schema billing_private from public, anon, authenticated, service_role;
revoke all on all sequences in schema billing_private from public, anon, authenticated, service_role;

create or replace function billing_private.reject_financial_mutation()
returns trigger language plpgsql set search_path = pg_catalog
as $$
begin
  raise exception 'Issued financial records are append-only' using errcode = '42501';
end;
$$;

create or replace function billing_private.protect_invoice()
returns trigger language plpgsql set search_path = pg_catalog
as $$
declare v_paid bigint;
begin
  if tg_op = 'DELETE' then
    raise exception 'Issued invoices cannot be deleted' using errcode = '42501';
  end if;
  if (to_jsonb(new) - 'status' - 'updated_at') is distinct from
     (to_jsonb(old) - 'status' - 'updated_at') then
    raise exception 'Issued invoice identity and financial fields are immutable' using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    select coalesce(sum(amount_paise),0)::bigint into v_paid
      from billing_private.bank_credit_evidence where invoice_id=old.id;
    if not ((old.status in ('UNPAID','PARTIAL') and new.status='PARTIAL'
             and v_paid > 0 and v_paid < old.total_paise) or
            (old.status in ('UNPAID','PARTIAL') and new.status='PAID'
             and v_paid=old.total_paise)) then
      raise exception 'Invalid verified settlement transition' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists immutable_invoice on billing_private.invoices;
create trigger immutable_invoice before update or delete on billing_private.invoices
for each row execute function billing_private.protect_invoice();

create or replace function billing_private.protect_line_insert()
returns trigger language plpgsql set search_path = pg_catalog
as $$
begin
  -- Invoice creation appends its seal audit only after all original lines.
  -- Share the invoice lock with settlement and concurrent insertion attempts.
  perform 1 from billing_private.invoices where id=new.invoice_id for update;
  if exists (select 1 from billing_private.audit_events
             where invoice_id=new.invoice_id and event_type='INVOICE_CREATED') then
    raise exception 'Issued invoice lines are sealed' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists sealed_invoice_lines on billing_private.invoice_lines;
create trigger sealed_invoice_lines before insert on billing_private.invoice_lines
for each row execute function billing_private.protect_line_insert();

drop trigger if exists immutable_invoice_lines on billing_private.invoice_lines;
create trigger immutable_invoice_lines before update or delete on billing_private.invoice_lines
for each row execute function billing_private.reject_financial_mutation();
drop trigger if exists immutable_bank_evidence on billing_private.bank_credit_evidence;
create trigger immutable_bank_evidence before update or delete on billing_private.bank_credit_evidence
for each row execute function billing_private.reject_financial_mutation();
drop trigger if exists immutable_audit_events on billing_private.audit_events;
create trigger immutable_audit_events before update or delete on billing_private.audit_events
for each row execute function billing_private.reject_financial_mutation();

-- Row triggers do not intercept TRUNCATE. Protect that path explicitly too.
drop trigger if exists no_truncate on billing_private.invoices;
create trigger no_truncate before truncate on billing_private.invoices
execute function billing_private.reject_financial_mutation();
drop trigger if exists no_truncate on billing_private.invoice_lines;
create trigger no_truncate before truncate on billing_private.invoice_lines
execute function billing_private.reject_financial_mutation();
drop trigger if exists no_truncate on billing_private.bank_credit_evidence;
create trigger no_truncate before truncate on billing_private.bank_credit_evidence
execute function billing_private.reject_financial_mutation();
drop trigger if exists no_truncate on billing_private.audit_events;
create trigger no_truncate before truncate on billing_private.audit_events
execute function billing_private.reject_financial_mutation();
drop trigger if exists no_truncate on billing_private.receipts;
create trigger no_truncate before truncate on billing_private.receipts
execute function billing_private.reject_financial_mutation();
revoke all on all functions in schema billing_private from public, anon, authenticated, service_role;
-- No policies = default-deny to non-owner roles; service-role access requires separate authenticated admin API.
-- IMPORTANT: A controlled server-side transaction must validate sums, lock invoice row,
-- verify evidence independently, and append audit event before changing status.
-- Only reviewed SECURITY DEFINER RPCs may append records. Database owners can
-- disable triggers; restrict owner/DDL credentials outside the application.
commit;
