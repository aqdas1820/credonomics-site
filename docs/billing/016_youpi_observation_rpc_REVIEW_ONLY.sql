-- REVIEW ONLY. DO NOT APPLY BEFORE CONFIRMING THE CREDONOMICS DATABASE.
-- Independent of settlement: a verified YouPI webhook is observation evidence,
-- NOT booked Slice credit. No status, receipt, or bank-credit writes here.
-- Requires billing_private.invoices from 012_billing_private_review.sql.
begin;

create table if not exists billing_private.youpi_observations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict,
  payment_id uuid not null,
  order_id text not null check (length(order_id) between 1 and 128),
  event text not null check (event in ('SUCCESS','FAILED','EXPIRED','CANCELLED')),
  amount_paise bigint not null check (amount_paise > 0 and amount_paise <= 10000000000),
  currency text not null default 'INR' check (currency='INR'),
  utr text check (utr is null or utr ~ '^[A-Z0-9-]{8,80}$'),
  raw_sha256 text not null unique check (raw_sha256 ~ '^[0-9a-f]{64}$'),
  received_at timestamptz not null default now(),
  unique(payment_id, event),
  check (event <> 'SUCCESS' or utr is not null)
);

alter table billing_private.youpi_observations enable row level security;
revoke all on table billing_private.youpi_observations from public, anon, authenticated;
-- Append-only gateway observations, including for the service role.
create or replace function billing_private.reject_observation_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin
  raise exception 'Gateway observations are append-only';
end;
$$;
drop trigger if exists immutable_youpi_observation on billing_private.youpi_observations;
create trigger immutable_youpi_observation
before update or delete on billing_private.youpi_observations
for each row execute function billing_private.reject_observation_mutation();

create or replace function public.billing_record_youpi_observation(
  p_payment_id uuid, p_order_id text, p_event text,
  p_amount_paise bigint, p_utr text, p_raw_sha256 text
) returns jsonb
language plpgsql security definer
set search_path=pg_catalog, pg_temp
as $$
declare
  v_invoice billing_private.invoices%rowtype;
  v_id uuid;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  if p_payment_id is null or p_order_id is null or p_event is null or
     p_event not in ('SUCCESS','FAILED','EXPIRED','CANCELLED') or
     p_raw_sha256 !~ '^[0-9a-f]{64}$' or
     p_amount_paise is null or p_amount_paise <= 0 or p_amount_paise > 10000000000 or
     (p_utr is not null and p_utr !~ '^[A-Z0-9-]{8,80}$') or
     (p_event = 'SUCCESS' and p_utr is null) then
    raise exception 'Invalid gateway observation';
  end if;
  select * into v_invoice from billing_private.invoices where invoice_number=p_order_id;
  if not found then raise exception 'Unknown invoice order'; end if;
  if v_invoice.total_paise <> p_amount_paise then
    raise exception 'Gateway amount does not match issued invoice';
  end if;

  -- Both unique(payment_id,event) and unique(raw_sha256) are durable anti-replay
  -- protections. Retries are acknowledged but do not duplicate any audit entry.
  insert into billing_private.youpi_observations (
    invoice_id, payment_id, order_id, event,
    amount_paise, utr, raw_sha256
  ) values (
    v_invoice.id, p_payment_id, p_order_id, p_event,
    p_amount_paise, p_utr, p_raw_sha256
  ) on conflict do nothing
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('recorded',false,'decision','REVIEW_REQUIRED','duplicate',true);
  end if;

  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
  values (v_invoice.id,'YOUPI_OBSERVATION','YOUPI_GATEWAY',jsonb_build_object(
    'paymentId',p_payment_id,'event',p_event,'amountPaise',p_amount_paise,
    'sha256',p_raw_sha256,'decision','REVIEW_REQUIRED'
  ));
  -- Crucially: no invoice status, bank_credit_evidence or receipts update.
  return jsonb_build_object('recorded',true,'decision','REVIEW_REQUIRED','duplicate',false);
end;
$$;
revoke all on function public.billing_record_youpi_observation(uuid,text,text,bigint,text,text)
  from public, anon, authenticated;
grant execute on function public.billing_record_youpi_observation(uuid,text,text,bigint,text,text)
  to service_role;
commit;
