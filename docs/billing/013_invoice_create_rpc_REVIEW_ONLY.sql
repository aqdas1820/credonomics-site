-- CredoNomics Billing v1: REVIEW-ONLY RPC MIGRATION (NOT APPLIED).
-- Requires 012_billing_private_review.sql first. Apply only after Supabase
-- project/schema confirmation, access review, and backup/recovery plan.
-- Never expose billing_private schema to PostgREST or anon/authenticated.
begin;

create sequence if not exists billing_private.invoice_sequence;
revoke all on sequence billing_private.invoice_sequence from public, anon, authenticated;

create or replace function public.billing_create_invoice(
  p_customer_name text,
  p_issued_on date,
  p_customer_phone_e164 text,
  p_lines jsonb,
  p_operator_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, billing_private
as $$
declare
  v_invoice_id uuid;
  v_number text;
  v_total bigint := 0;
  v_qty integer;
  v_rate bigint;
  v_line_total bigint;
  v_position integer := 0;
  v_line jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_operator_id is null or p_customer_name is null or
     length(btrim(p_customer_name)) not between 1 and 120 or p_issued_on is null then
    raise exception 'Invalid invoice header';
  end if;
  if p_customer_phone_e164 is not null and
     p_customer_phone_e164 !~ '^\+[1-9][0-9]{6,14}$' then
    raise exception 'Invalid phone';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception 'Invoice lines required';
  end if;
  if jsonb_array_length(p_lines) < 1 or jsonb_array_length(p_lines) > 100 then
    raise exception 'Invalid line count';
  end if;
  -- Validate ALL line totals before allocating number or inserting records.
  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    if jsonb_typeof(v_line) <> 'object' or
       length(btrim(coalesce(v_line->>'description',''))) not between 1 and 300 then
      raise exception 'Invalid line description';
    end if;
    v_qty := (v_line->>'quantity')::integer;
    v_rate := (v_line->>'rate_paise')::bigint;
    v_line_total := (v_line->>'line_total_paise')::bigint;
    if v_qty <= 0 or v_rate < 0 or v_line_total < 0 or
       v_qty::numeric * v_rate::numeric <> v_line_total or
       v_line_total > 10000000000 then
      raise exception 'Invalid line calculation';
    end if;
    v_total := v_total + v_line_total;
    if v_total > 10000000000 then raise exception 'Invoice amount exceeded'; end if;
  end loop;
  if v_total <= 0 then raise exception 'Invoice amount must be positive'; end if;

  v_number := 'CN-' || to_char(p_issued_on,'YYYY') || '-' ||
              lpad(nextval('billing_private.invoice_sequence')::text, 8, '0');
  insert into billing_private.invoices(
    invoice_number, customer_name, customer_phone_e164, issued_on, total_paise, status
  ) values (
    v_number, btrim(p_customer_name), p_customer_phone_e164, p_issued_on, v_total, 'UNPAID'
  ) returning id into v_invoice_id;

  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    insert into billing_private.invoice_lines(
      invoice_id, position, description, quantity, rate_paise, line_total_paise
    ) values (
      v_invoice_id, v_position, btrim(v_line->>'description'),
      (v_line->>'quantity')::integer, (v_line->>'rate_paise')::bigint,
      (v_line->>'line_total_paise')::bigint
    );
    v_position := v_position + 1;
  end loop;
  insert into billing_private.audit_events(invoice_id, event_type, actor, details)
  values (v_invoice_id, 'INVOICE_CREATED', p_operator_id::text,
          jsonb_build_object('origin','ADMIN','total_paise',v_total));
  return jsonb_build_object(
    'id',v_invoice_id, 'invoiceNumber',v_number,
    'totalPaise',v_total, 'status','UNPAID'
  );
end;
$$;

revoke all on function public.billing_create_invoice(text,date,text,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.billing_create_invoice(text,date,text,jsonb,uuid) to service_role;
commit;
