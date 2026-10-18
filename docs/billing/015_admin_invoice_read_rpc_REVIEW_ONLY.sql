-- REVIEW ONLY: authenticated admin read models. Do not execute on live Supabase
-- until project, RLS, recovery and access scope have been reviewed.
begin;
create or replace function public.billing_list_invoices(p_limit integer default 25)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, billing_private
as $$
declare v_records jsonb;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'Invalid list limit';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', i.id, 'invoiceNumber', i.invoice_number,
    'customer', i.customer_name, 'date', i.issued_on,
    'totalPaise', i.total_paise, 'status', i.status, 'origin', i.origin
  ) order by i.created_at desc), '[]'::jsonb)
  into v_records
  from (
    select * from billing_private.invoices order by created_at desc limit p_limit
  ) i;
  return v_records;
end;
$$;
revoke all on function public.billing_list_invoices(integer) from public, anon, authenticated;
grant execute on function public.billing_list_invoices(integer) to service_role;

create or replace function public.billing_get_invoice(p_invoice_id uuid)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, billing_private
as $$
declare v_invoice jsonb;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  select jsonb_build_object(
    'id',i.id,'invoiceNumber',i.invoice_number,'customer',i.customer_name,
    'address',i.customer_address,'date',i.issued_on,'totalPaise',i.total_paise,
    'status',i.status,'origin',i.origin,
    'paidPaise',(select coalesce(sum(c.amount_paise),0)::bigint
      from billing_private.bank_credit_evidence c where c.invoice_id=i.id),
    'items',(select coalesce(jsonb_agg(jsonb_build_object(
      'position',l.position,'description',l.description,'quantity',l.quantity,
      'ratePaise',l.rate_paise,'lineTotalPaise',l.line_total_paise)
      order by l.position),'[]'::jsonb)
      from billing_private.invoice_lines l where l.invoice_id=i.id)
  ) into v_invoice
  from billing_private.invoices i where i.id=p_invoice_id;
  if v_invoice is null then raise exception 'Invoice not found'; end if;
  return v_invoice;
end;
$$;
revoke all on function public.billing_get_invoice(uuid) from public, anon, authenticated;
grant execute on function public.billing_get_invoice(uuid) to service_role;
commit;
