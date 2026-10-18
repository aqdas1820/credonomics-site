-- REVIEW-ONLY. NOT APPLIED TO SUPABASE.
-- Requires 012 private tables. Only a human who independently checked
-- booked Slice statement credit may call the authenticated admin API.
-- Gateway SUCCESS, screenshots or customer-supplied UTR never qualify.
begin;
create or replace function public.billing_verify_slice_credit(
  p_invoice_id uuid,
  p_utr text,
  p_amount_paise bigint,
  p_booked_at timestamptz,
  p_evidence_reference text,
  p_operator_id uuid
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, public, billing_private
as $$
declare
  v_invoice billing_private.invoices%rowtype;
  v_utr text;
  v_paid bigint;
  v_outstanding bigint;
  v_new_status text;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  v_utr := upper(btrim(coalesce(p_utr,'')));
  if p_operator_id is null or p_invoice_id is null or
    v_utr !~ '^[A-Z0-9-]{8,80}$' or
    p_amount_paise is null or p_amount_paise <= 0 or p_amount_paise > 10000000000 or
    p_booked_at is null or p_booked_at > now() + interval '1 minute' or
    length(btrim(coalesce(p_evidence_reference,''))) not between 1 and 500 then
    raise exception 'Invalid booked-credit evidence';
  end if;

  -- Serialize credit reviews per invoice to prevent concurrent over-credit.
  select * into v_invoice from billing_private.invoices
  where id=p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if v_invoice.status not in ('UNPAID','PARTIAL') then
    raise exception 'Invoice not payable';
  end if;

  select coalesce(sum(amount_paise),0)::bigint into v_paid
  from billing_private.bank_credit_evidence where invoice_id=p_invoice_id;
  if v_paid + p_amount_paise > v_invoice.total_paise then
    raise exception 'Credit exceeds invoice outstanding';
  end if;
  insert into billing_private.bank_credit_evidence(
    invoice_id, bank_name, utr, amount_paise, credited_at,
    reviewed_by, verified_at, evidence_reference
  ) values (
    p_invoice_id, 'Slice', v_utr, p_amount_paise, p_booked_at,
    p_operator_id::text, now(), btrim(p_evidence_reference)
  );
  v_paid := v_paid + p_amount_paise;
  v_outstanding := v_invoice.total_paise - v_paid;
  v_new_status := case when v_outstanding=0 then 'PAID' else 'PARTIAL' end;
  update billing_private.invoices
  set status=v_new_status, updated_at=now() where id=p_invoice_id;

  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
  values (
    p_invoice_id,'BANK_CREDIT_VERIFIED',p_operator_id::text,
    jsonb_build_object('bank','Slice','utr',v_utr,'amount_paise',p_amount_paise,
      'credited_at',p_booked_at,'evidence_reference',p_evidence_reference)
  );
  insert into billing_private.audit_events(invoice_id,event_type,actor,details)
  values (
    p_invoice_id,case when v_new_status='PAID' then 'INVOICE_FULLY_PAID' else 'INVOICE_PARTIALLY_PAID' end,
    p_operator_id::text,jsonb_build_object('paid_paise',v_paid,'outstanding_paise',v_outstanding)
  );
  return jsonb_build_object(
    'invoiceId',p_invoice_id,'status',v_new_status,
    'paidPaise',v_paid,'outstandingPaise',v_outstanding,
    'canIssuePaidReceipt',v_new_status='PAID'
  );
end;
$$;
revoke all on function public.billing_verify_slice_credit(uuid,text,bigint,timestamptz,text,uuid)
  from public, anon, authenticated;
grant execute on function public.billing_verify_slice_credit(uuid,text,bigint,timestamptz,text,uuid)
  to service_role;
commit;
