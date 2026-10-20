-- REVIEW ONLY. Requires 012-016; no hosted application authorized.
-- Bind every observed reference to one invoice/payment, including across events.
-- Backfill fails atomically on historical conflicts; never delete financial data.
begin;
lock table billing_private.youpi_observations in share row exclusive mode;
create table billing_private.youpi_utr_claims (
  utr text primary key check (utr ~ '^[A-Z0-9-]{8,80}$'),
  payment_id uuid not null unique,
  invoice_id uuid not null references billing_private.invoices(id) on delete restrict
);
alter table billing_private.youpi_utr_claims enable row level security;
revoke all on billing_private.youpi_utr_claims from public, anon, authenticated, service_role;
insert into billing_private.youpi_utr_claims(utr,payment_id,invoice_id)
  select distinct upper(utr),payment_id,invoice_id
  from billing_private.youpi_observations where utr is not null;

create function billing_private.claim_youpi_utr()
returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare claimed billing_private.youpi_utr_claims%rowtype;
begin
  if new.utr is null then return new; end if;
  insert into billing_private.youpi_utr_claims(utr,payment_id,invoice_id)
    values(upper(new.utr),new.payment_id,new.invoice_id) on conflict(utr) do nothing;
  select * into claimed from billing_private.youpi_utr_claims where utr=upper(new.utr);
  if claimed.payment_id is distinct from new.payment_id or claimed.invoice_id is distinct from new.invoice_id then
    raise exception 'YouPI reference already bound' using errcode='23505';
  end if;
  return new;
end $$;
create trigger claim_youpi_utr before insert on billing_private.youpi_observations
  for each row execute function billing_private.claim_youpi_utr();
-- Claim history is immutable just like the append-only observation ledger.
create trigger immutable_youpi_utr_claim before update or delete on billing_private.youpi_utr_claims
  for each row execute function billing_private.reject_observation_mutation();
create trigger no_truncate before truncate on billing_private.youpi_utr_claims
  execute function billing_private.reject_observation_mutation();
revoke all on function billing_private.claim_youpi_utr() from public, anon, authenticated, service_role;
commit;
