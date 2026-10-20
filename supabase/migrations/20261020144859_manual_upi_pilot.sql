-- REVIEW ONLY. NOT AUTHORIZED FOR HOSTED APPLICATION.
-- Prerequisites, in order: 012,013,014,015,016,Phase28 link ledger,017.
-- Manual UPI uses the existing Slice bank ledger. No bank/provider API is implied.
begin;
create table billing_private.manual_upi_intents (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null unique references billing_private.invoices(id) on delete restrict,
  beneficiary_id uuid not null,
  vpa text not null check (vpa ~ '^[a-zA-Z0-9._-]{2,128}@[a-zA-Z0-9.-]{2,64}$'),
  payee_name text not null check (length(payee_name) between 2 and 100),
  bank_account_ref text not null check (bank_account_ref ~ '^[a-zA-Z0-9_-]{8,80}$'),
  beneficiary_digest text not null check (beneficiary_digest ~ '^[a-f0-9]{64}$'),
  issued_ms bigint not null,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','REVOKED')),
  view_minute timestamptz,
  view_count integer not null default 0,
  created_by uuid not null
);
create table billing_private.manual_upi_reviews (
  intent_id uuid primary key references billing_private.manual_upi_intents(id) on delete restrict,
  invoice_id uuid not null unique references billing_private.invoices(id) on delete restrict,
  utr text not null unique check (utr ~ '^[A-Z0-9-]{8,80}$'),
  amount_paise bigint not null check (amount_paise between 1 and 100000000),
  booked_at timestamptz not null,
  evidence_reference text not null check (length(evidence_reference) between 8 and 500),
  reviewed_by uuid not null,
  reviewed_at timestamptz not null default now()
);
alter table billing_private.manual_upi_intents enable row level security;
alter table billing_private.manual_upi_reviews enable row level security;
revoke all on billing_private.manual_upi_intents,billing_private.manual_upi_reviews from public,anon,authenticated,service_role;
create trigger immutable_manual_review before update or delete on billing_private.manual_upi_reviews
  for each row execute function billing_private.reject_financial_evidence_mutation();
create trigger no_truncate before truncate on billing_private.manual_upi_reviews
  execute function billing_private.reject_financial_evidence_mutation();
create function billing_private.preserve_manual_upi_intent() returns trigger
language plpgsql set search_path=pg_catalog,pg_temp as $$
begin
  if tg_op='DELETE' or (to_jsonb(new)-'state'-'view_minute'-'view_count') is distinct from
    (to_jsonb(old)-'state'-'view_minute'-'view_count') or (old.state='REVOKED' and new.state<>'REVOKED') then
    raise exception 'Manual UPI intent is immutable';
  end if;
  return new;
end $$;
create trigger immutable_manual_intent before update or delete on billing_private.manual_upi_intents
  for each row execute function billing_private.preserve_manual_upi_intent();
create trigger no_truncate before truncate on billing_private.manual_upi_intents
  execute function billing_private.reject_financial_evidence_mutation();

-- Both gateways serialize on the same invoice. Never create competing active instructions.
create function billing_private.prevent_competing_youpi_link() returns trigger
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  perform 1 from billing_private.invoices where id=new.invoice_id for update;
  if exists(select 1 from billing_private.manual_upi_intents where invoice_id=new.invoice_id and state='ACTIVE') then
    raise exception 'Manual UPI instructions already exist';
  end if;
  return new;
end $$;
create trigger no_competing_manual_upi before insert on billing_private.youpi_links
  for each row execute function billing_private.prevent_competing_youpi_link();

create function public.billing_manual_upi_reserve(p_invoice uuid,p_beneficiary uuid,p_vpa text,
  p_payee text,p_bank_ref text,p_fingerprint text,p_actor uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare inv billing_private.invoices%rowtype; intent billing_private.manual_upi_intents%rowtype;
begin
  if coalesce(auth.role(),'')<>'service_role' or p_actor is null then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_beneficiary is null or p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid beneficiary'; end if;
  select * into inv from billing_private.invoices where id=p_invoice for update;
  if not found or inv.status<>'UNPAID' or inv.total_paise not between 1 and 100000000 or
    exists(select 1 from billing_private.bank_credit_evidence where invoice_id=p_invoice) or
    exists(select 1 from billing_private.youpi_links where invoice_id=p_invoice and state<>'REVOKED') then raise exception 'Invoice not payable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor::text,31));
  if (select count(*) from billing_private.audit_events where actor=p_actor::text and event_type='MANUAL_UPI_LINK_REQUEST' and event_at>now()-interval '1 minute')>=10 then
    raise exception 'Manual UPI rate limited' using errcode='P0031'; end if;
  insert into billing_private.audit_events(invoice_id,event_type,actor) values(p_invoice,'MANUAL_UPI_LINK_REQUEST',p_actor::text);
  select * into intent from billing_private.manual_upi_intents where invoice_id=p_invoice;
  if found then
    if intent.state<>'ACTIVE' or intent.issued_ms+86400000<=floor(extract(epoch from now())*1000)::bigint or
      (intent.beneficiary_id,intent.vpa,intent.payee_name,intent.bank_account_ref,intent.beneficiary_digest) is distinct from
      (p_beneficiary,p_vpa,p_payee,p_bank_ref,p_fingerprint) then raise exception 'Manual link unavailable; review required'; end if;
  else
    insert into billing_private.manual_upi_intents(invoice_id,beneficiary_id,vpa,payee_name,bank_account_ref,beneficiary_digest,issued_ms,created_by)
      values(p_invoice,p_beneficiary,p_vpa,p_payee,p_bank_ref,p_fingerprint,floor(extract(epoch from now())*1000)::bigint,p_actor) returning * into intent;
    insert into billing_private.audit_events(invoice_id,event_type,actor,details)
      values(p_invoice,'MANUAL_UPI_LINK_ISSUED',p_actor::text,jsonb_build_object('intentId',intent.id,'beneficiaryId',p_beneficiary));
  end if;
  return jsonb_build_object('intentId',intent.id,'issuedAt',intent.issued_ms);
end $$;

create function public.billing_manual_upi_view(p_intent uuid,p_issued bigint,p_fingerprint text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare inv billing_private.invoices%rowtype; intent billing_private.manual_upi_intents%rowtype; verified boolean; n integer;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  select i.* into inv from billing_private.invoices i join billing_private.manual_upi_intents m on m.invoice_id=i.id where m.id=p_intent for update of i;
  if not found then return null; end if;
  select * into intent from billing_private.manual_upi_intents where id=p_intent for update;
  if intent.state<>'ACTIVE' or intent.issued_ms is distinct from p_issued or intent.beneficiary_digest is distinct from p_fingerprint or
    intent.issued_ms+86400000<=floor(extract(epoch from now())*1000)::bigint then return null; end if;
  n:=case when intent.view_minute=date_trunc('minute',now()) then intent.view_count+1 else 1 end;
  if n>30 then return null; end if;
  update billing_private.manual_upi_intents set view_count=n,view_minute=date_trunc('minute',now()) where id=p_intent;
  verified:=inv.status='PAID' and exists(select 1 from billing_private.manual_upi_reviews r join billing_private.bank_credit_evidence b on b.invoice_id=r.invoice_id and b.utr=r.utr
    join billing_private.receipts rc on rc.invoice_id=r.invoice_id where r.intent_id=p_intent and b.amount_paise=inv.total_paise);
  if not verified and (inv.status<>'UNPAID' or exists(select 1 from billing_private.bank_credit_evidence where invoice_id=inv.id)) then return null; end if;
  return jsonb_build_object('intentId',intent.id,'invoiceId',inv.id,'invoiceNumber',inv.invoice_number,'amountPaise',inv.total_paise,
    'issuedAt',intent.issued_ms,'status',case when verified then 'PAID' else 'UNPAID' end,'bankVerified',verified) ||
    case when verified then '{}'::jsonb else jsonb_build_object('vpa',intent.vpa,'payee',intent.payee_name) end;
end $$;

create function public.billing_manual_upi_revoke(p_invoice uuid,p_actor uuid) returns boolean
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  if coalesce(auth.role(),'')<>'service_role' or p_actor is null then raise exception 'Not authorized' using errcode='42501'; end if;
  perform 1 from billing_private.invoices where id=p_invoice for update;
  update billing_private.manual_upi_intents set state='REVOKED' where invoice_id=p_invoice and state='ACTIVE';
  if not found then return false; end if;
  insert into billing_private.audit_events(invoice_id,event_type,actor) values(p_invoice,'MANUAL_UPI_LINK_REVOKED',p_actor::text);
  return true;
end $$;

create function public.billing_manual_upi_admin_state(p_invoice uuid,p_fingerprint text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare intent billing_private.manual_upi_intents%rowtype;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into intent from billing_private.manual_upi_intents where invoice_id=p_invoice and beneficiary_digest=p_fingerprint;
  if not found then return null; end if;
  return jsonb_build_object('intentId',intent.id,'state',intent.state);
end $$;

-- Prevent the legacy credit endpoint from bypassing beneficiary-bound manual review.
create function billing_private.require_manual_upi_review() returns trigger
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  if exists(select 1 from billing_private.manual_upi_intents where invoice_id=new.invoice_id) and not exists(
    select 1 from billing_private.manual_upi_reviews r where r.invoice_id=new.invoice_id and r.utr=new.utr
      and r.amount_paise=new.amount_paise and r.booked_at=new.credited_at and r.reviewed_by::text=new.reviewed_by
  ) then raise exception 'Beneficiary-bound manual review required'; end if;
  return new;
end $$;
create trigger require_manual_upi_review before insert on billing_private.bank_credit_evidence
  for each row execute function billing_private.require_manual_upi_review();

create function public.billing_verify_manual_upi_credit(p_invoice uuid,p_intent uuid,p_fingerprint text,
  p_utr text,p_amount bigint,p_booked timestamptz,p_evidence text,p_actor uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare inv billing_private.invoices%rowtype; intent billing_private.manual_upi_intents%rowtype;
  review billing_private.manual_upi_reviews%rowtype; v_utr text:=upper(btrim(p_utr));
begin
  if coalesce(auth.role(),'')<>'service_role' or p_actor is null then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into inv from billing_private.invoices where id=p_invoice for update;
  if not found then raise exception 'Invoice not found'; end if;
  select * into intent from billing_private.manual_upi_intents where id=p_intent and invoice_id=p_invoice;
  if not found or intent.beneficiary_digest is distinct from p_fingerprint then raise exception 'Beneficiary mismatch'; end if;
  if v_utr is null or v_utr !~ '^[A-Z0-9-]{8,80}$' or p_amount is distinct from inv.total_paise or
    p_booked is null or p_booked>now()+interval '1 minute' or p_booked<to_timestamp(intent.issued_ms/1000.0)-interval '1 minute' or
    length(btrim(coalesce(p_evidence,''))) not between 8 and 500 then raise exception 'Invalid exact booked credit'; end if;
  select * into review from billing_private.manual_upi_reviews where intent_id=p_intent;
  if found then
    if (review.utr,review.amount_paise,review.booked_at,review.evidence_reference,review.reviewed_by) is distinct from
      (v_utr,p_amount,p_booked,btrim(p_evidence),p_actor) or inv.status<>'PAID' then raise exception 'Conflicting manual review'; end if;
    return jsonb_build_object('invoiceId',p_invoice,'status','PAID','paidPaise',inv.total_paise,'outstandingPaise',0,'canIssuePaidReceipt',true,'duplicate',true);
  end if;
  -- Expired/revoked instructions can still have an actual late credit. An authorized
  -- operator may reconcile it, while public instructions remain unavailable.
  if exists(select 1 from billing_private.youpi_utr_claims where utr=v_utr and invoice_id<>p_invoice) then raise exception 'Reference bound to another invoice'; end if;
  insert into billing_private.manual_upi_reviews(intent_id,invoice_id,utr,amount_paise,booked_at,evidence_reference,reviewed_by)
    values(p_intent,p_invoice,v_utr,p_amount,p_booked,btrim(p_evidence),p_actor);
  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
    values(p_invoice,'MANUAL_UPI_BANK_REVIEW',p_actor::text,jsonb_build_object('intentId',p_intent,'beneficiaryId',intent.beneficiary_id,'mode','MANUAL_OFFICIAL_BANK_RECORD'));
  return public.billing_verify_slice_credit(p_invoice,v_utr,p_amount,p_booked,btrim(p_evidence),p_actor) || jsonb_build_object('duplicate',false);
end $$;
revoke all on function billing_private.preserve_manual_upi_intent(),billing_private.prevent_competing_youpi_link(),billing_private.require_manual_upi_review() from public,anon,authenticated,service_role;
revoke all on function public.billing_manual_upi_reserve(uuid,uuid,text,text,text,text,uuid),public.billing_manual_upi_view(uuid,bigint,text),
  public.billing_manual_upi_revoke(uuid,uuid),public.billing_manual_upi_admin_state(uuid,text),public.billing_verify_manual_upi_credit(uuid,uuid,text,text,bigint,timestamptz,text,uuid) from public,anon,authenticated;
grant execute on function public.billing_manual_upi_reserve(uuid,uuid,text,text,text,text,uuid),public.billing_manual_upi_view(uuid,bigint,text),
  public.billing_manual_upi_revoke(uuid,uuid),public.billing_manual_upi_admin_state(uuid,text),public.billing_verify_manual_upi_credit(uuid,uuid,text,text,bigint,timestamptz,text,uuid) to service_role;
-- Resolve the live advisor's grant warning without changing the RLS event trigger.
do $$ begin
  if exists(select 1 from pg_proc where oid=to_regprocedure('public.rls_auto_enable()') and prorettype='event_trigger'::regtype) then
    revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
  end if;
end $$;
commit;
