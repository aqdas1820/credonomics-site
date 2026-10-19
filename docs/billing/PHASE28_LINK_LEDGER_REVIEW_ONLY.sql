-- REVIEW ONLY: no hosted application. Requires reviewed 012-016 billing SQL.
-- Independent of settlement: these functions never write bank credit or receipts.
begin;
create table billing_private.youpi_links (
  invoice_id uuid not null references billing_private.invoices(id),
  merchant_id uuid not null,
  actor_id uuid not null,
  issued_ms bigint not null,
  payment_id uuid unique,
  token_digest text unique check (token_digest ~ '^[a-f0-9]{64}$'),
  state text not null default 'PENDING' check (state in ('PENDING','READY','REVOKED')),
  view_minute timestamptz,
  view_count integer not null default 0,
  primary key(invoice_id, merchant_id),
  check (state <> 'READY' or (payment_id is not null and token_digest is not null))
);
alter table billing_private.youpi_links enable row level security;
revoke all on billing_private.youpi_links from public, anon, authenticated, service_role;

create function public.billing_youpi_link_reserve(p_invoice uuid, p_merchant uuid, p_actor uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog, pg_temp as $$
declare
  inv billing_private.invoices%rowtype;
  link billing_private.youpi_links%rowtype;
  attempts bigint;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_invoice is null or p_merchant is null or p_actor is null then raise exception 'Invalid identity'; end if;
  select * into inv from billing_private.invoices where id=p_invoice for update;
  if not found or inv.status <> 'UNPAID' or exists(select 1 from billing_private.bank_credit_evidence where invoice_id=inv.id) or inv.total_paise not between 1 and 100000000 then
    return jsonb_build_object('decision','BLOCKED');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor::text, 28));
  select count(*) into attempts from billing_private.audit_events
    where actor=p_actor::text and event_type='YOUPI_LINK_REQUEST' and event_at > now()-interval '1 minute';
  if attempts >= 10 then return jsonb_build_object('decision','RATE_LIMITED'); end if;
  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
    values(p_invoice,'YOUPI_LINK_REQUEST',p_actor::text,jsonb_build_object('merchantId',p_merchant));
  select * into link from billing_private.youpi_links where invoice_id=p_invoice and merchant_id=p_merchant;
  if found then
    if link.state <> 'READY' or link.issued_ms + 259200000 <= floor(extract(epoch from now())*1000)::bigint then
      return jsonb_build_object('decision','BLOCKED');
    end if;
    return jsonb_build_object('decision','REUSE','issuedAt',link.issued_ms,'paymentId',link.payment_id);
  end if;
  -- A different merchant cannot create another session for this same invoice.
  if exists(select 1 from billing_private.youpi_links where invoice_id=p_invoice) then
    return jsonb_build_object('decision','BLOCKED');
  end if;
  insert into billing_private.youpi_links(invoice_id,merchant_id,actor_id,issued_ms)
    values(p_invoice,p_merchant,p_actor,floor(extract(epoch from now())*1000)::bigint) returning * into link;
  return jsonb_build_object('decision','CREATE','issuedAt',link.issued_ms);
end $$;

create function public.billing_youpi_link_complete(p_invoice uuid, p_merchant uuid, p_payment uuid, p_digest text)
returns boolean language plpgsql security definer set search_path=pg_catalog, pg_temp as $$
declare inv billing_private.invoices%rowtype; link billing_private.youpi_links%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_payment is null or p_digest is null or p_digest !~ '^[a-f0-9]{64}$' then return false; end if;
  select * into inv from billing_private.invoices where id=p_invoice for update;
  if not found or inv.status <> 'UNPAID' or exists(select 1 from billing_private.bank_credit_evidence where invoice_id=inv.id) then return false; end if;
  select * into link from billing_private.youpi_links where invoice_id=p_invoice and merchant_id=p_merchant for update;
  if not found or link.state='REVOKED' or link.issued_ms+259200000 <= floor(extract(epoch from now())*1000)::bigint then return false; end if;
  if link.state='READY' then return link.payment_id=p_payment and link.token_digest=p_digest; end if;
  update billing_private.youpi_links set state='READY',payment_id=p_payment,token_digest=p_digest
    where invoice_id=p_invoice and merchant_id=p_merchant;
  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
    values(p_invoice,'YOUPI_LINK_READY',link.actor_id::text,jsonb_build_object('paymentId',p_payment,'merchantId',p_merchant));
  return true;
end $$;

create function public.billing_youpi_link_access(p_digest text)
returns boolean language plpgsql security definer set search_path=pg_catalog, pg_temp as $$
declare link billing_private.youpi_links%rowtype; inv billing_private.invoices%rowtype; n integer;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_digest is null or p_digest !~ '^[a-f0-9]{64}$' then return false; end if;
  -- Follow the same invoice -> link locking order as completion to avoid deadlock.
  select i.* into inv from billing_private.invoices i join billing_private.youpi_links l on i.id=l.invoice_id
    where l.token_digest=p_digest for update of i;
  if not found or inv.status <> 'UNPAID' or exists(select 1 from billing_private.bank_credit_evidence where invoice_id=inv.id) then return false; end if;
  select * into link from billing_private.youpi_links where token_digest=p_digest for update;
  if not found or link.state <> 'READY' or link.issued_ms+259200000 <= floor(extract(epoch from now())*1000)::bigint then return false; end if;
  n := case when link.view_minute=date_trunc('minute',now()) then link.view_count+1 else 1 end;
  if n > 30 then return false; end if;
  update billing_private.youpi_links set view_minute=date_trunc('minute',now()),view_count=n where token_digest=p_digest;
  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
    values(link.invoice_id,'YOUPI_LINK_VIEW','BEARER',jsonb_build_object('paymentId',link.payment_id));
  return true;
end $$;

create function public.billing_youpi_link_revoke(p_invoice uuid, p_actor uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog, pg_temp as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' or p_actor is null then raise exception 'Not authorized' using errcode='42501'; end if;
  perform 1 from billing_private.invoices where id=p_invoice for update;
  update billing_private.youpi_links set state='REVOKED' where invoice_id=p_invoice and state <> 'REVOKED';
  if not found then return false; end if;
  insert into billing_private.audit_events(invoice_id,event_type,actor) values(p_invoice,'YOUPI_LINK_REVOKED',p_actor::text);
  return true;
end $$;

-- Map the new CN-<invoice UUID> order to the immutable legacy observation ledger,
-- only after binding the exact saved merchant/session/amount. Still REVIEW_REQUIRED.
create function public.billing_record_youpi_link_observation(p_invoice uuid, p_merchant uuid,
  p_payment uuid, p_event text, p_amount bigint, p_utr text, p_digest text)
returns jsonb language plpgsql security definer set search_path=pg_catalog, pg_temp as $$
declare inv billing_private.invoices%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into inv from billing_private.invoices where id=p_invoice;
  if not found or inv.total_paise is distinct from p_amount or not exists(
    select 1 from billing_private.youpi_links where invoice_id=p_invoice and merchant_id=p_merchant
      and payment_id=p_payment and token_digest is not null
  ) then raise exception 'Unbound gateway observation'; end if;
  return public.billing_record_youpi_observation(p_payment,inv.invoice_number,p_event,p_amount,p_utr,p_digest);
end $$;
revoke all on function public.billing_record_youpi_link_observation(uuid,uuid,uuid,text,bigint,text,text) from public,anon,authenticated;
grant execute on function public.billing_record_youpi_link_observation(uuid,uuid,uuid,text,bigint,text,text) to service_role;

revoke all on function public.billing_youpi_link_reserve(uuid,uuid,uuid),
  public.billing_youpi_link_complete(uuid,uuid,uuid,text), public.billing_youpi_link_access(text),
  public.billing_youpi_link_revoke(uuid,uuid) from public, anon, authenticated;
grant execute on function public.billing_youpi_link_reserve(uuid,uuid,uuid),
  public.billing_youpi_link_complete(uuid,uuid,uuid,text), public.billing_youpi_link_access(text),
  public.billing_youpi_link_revoke(uuid,uuid) to service_role;
commit;
