-- CredoNomics Billing: REVIEW ONLY. NOT APPLIED TO ANY DATABASE.
-- Requires 012_billing_private_review.sql and owner-approved project scope.
-- SQL service_role RPC: atomic immutable invoice identity, lines and audit.
begin;

create sequence if not exists billing_private.invoice_sequence;
revoke all on sequence billing_private.invoice_sequence from public, anon, authenticated;

create or replace function public.billing_create_invoice(
  p_customer_name text,
  p_issued_on date,
  p_customer_phone_e164 text,
  p_customer_address text,
  p_lines jsonb,
  p_operator_id uuid,
  p_origin text default 'ADMIN',
  p_source_event_key text default null
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_invoice_id uuid;
  v_number text;
  v_next bigint;
  v_total bigint := 0;
  v_qty integer;
  v_rate bigint;
  v_line_total bigint;
  v_position integer := 0;
  v_line jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_existing billing_private.invoices%rowtype;
  v_existing_lines jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_operator_id is null or p_origin is null or
     p_origin not in ('ADMIN','SYSTEM') or
     (p_origin = 'ADMIN' and p_source_event_key is not null) or
     (p_origin = 'SYSTEM' and
       (p_source_event_key is null or
        p_source_event_key !~ '^[A-Za-z0-9:_-]{8,128}$')) then
    raise exception 'Invalid invoice origin or source event';
  end if;
  if p_customer_name is null or
     length(btrim(p_customer_name)) not between 1 and 120 or
     p_issued_on is null then
    raise exception 'Invalid invoice header';
  end if;
  if p_customer_address is null or length(p_customer_address) > 300 then
    raise exception 'Invalid customer address';
  end if;
  if p_customer_phone_e164 is not null and
     p_customer_phone_e164 !~ '^\+[1-9][0-9]{6,14}$' then
    raise exception 'Invalid customer phone';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or
     jsonb_array_length(p_lines) not between 1 and 100 then
    raise exception 'Invalid invoice line count';
  end if;

  -- Never trust a client-submitted invoice total or status.
  -- Every line is independently recomputed from integer paise.
  for v_line in select value from jsonb_array_elements(p_lines) loop
    if jsonb_typeof(v_line) <> 'object' or
       length(btrim(coalesce(v_line->>'description',''))) not between 1 and 300 then
      raise exception 'Invalid invoice line description';
    end if;
    v_qty := (v_line->>'quantity')::integer;
    v_rate := (v_line->>'rate_paise')::bigint;
    v_line_total := (v_line->>'line_total_paise')::bigint;
    if v_qty is null or v_rate is null or v_line_total is null or
       v_qty <= 0 or v_rate < 0 or v_line_total < 0 or
       v_qty::numeric * v_rate::numeric <> v_line_total or
       v_line_total > 10000000000 then
      raise exception 'Invalid invoice line calculation';
    end if;
    v_total := v_total + v_line_total;
    if v_total > 10000000000 then
      raise exception 'Invoice total exceeds limit';
    end if;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'description', btrim(v_line->>'description'), 'quantity', v_qty,
      'rate_paise', v_rate, 'line_total_paise', v_line_total
    ));
  end loop;
  if v_total <= 0 then raise exception 'Invoice total must be positive'; end if;

  -- Serialize the absent-row case as well as retries. Hash collisions only
  -- serialize unrelated events; the unique source key remains the authority.
  -- Read committed RPC transactions see the committed winner after this lock.
  if p_origin = 'SYSTEM' then
    perform pg_advisory_xact_lock(hashtextextended(p_source_event_key, 0));
    select * into v_existing from billing_private.invoices
      where source_event_key = p_source_event_key;
    if found then
      select jsonb_agg(jsonb_build_object(
        'description', description, 'quantity', quantity,
        'rate_paise', rate_paise, 'line_total_paise', line_total_paise
      ) order by position) into v_existing_lines
      from billing_private.invoice_lines where invoice_id = v_existing.id;
      if v_existing.origin <> 'SYSTEM' or
         v_existing.customer_name is distinct from btrim(p_customer_name) or
         v_existing.customer_address is distinct from btrim(p_customer_address) or
         v_existing.customer_phone_e164 is distinct from p_customer_phone_e164 or
         v_existing.issued_on is distinct from p_issued_on or
         v_existing.total_paise is distinct from v_total or
         v_existing_lines is distinct from v_lines then
        raise exception 'SYSTEM_EVENT_PAYLOAD_CONFLICT' using errcode = 'P1701';
      end if;
      return jsonb_build_object(
        'id',v_existing.id, 'invoiceNumber',v_existing.invoice_number,
        'totalPaise',v_existing.total_paise, 'status',v_existing.status
      );
    end if;
  end if;

  v_next := nextval('billing_private.invoice_sequence');
  if v_next > 99999999 then raise exception 'Invoice sequence exhausted'; end if;
  v_number := 'CN-' || to_char(p_issued_on,'YYYY') || '-' || lpad(v_next::text, 8, '0');

  insert into billing_private.invoices(
    invoice_number, customer_name, customer_phone_e164, customer_address,
    issued_on, total_paise, status, origin, source_event_key
  ) values (
    v_number, btrim(p_customer_name), p_customer_phone_e164,
    btrim(p_customer_address), p_issued_on, v_total, 'UNPAID',
    p_origin, p_source_event_key
  ) returning id into v_invoice_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    insert into billing_private.invoice_lines(
      invoice_id, position, description, quantity,
      rate_paise, line_total_paise
    ) values (
      v_invoice_id, v_position, btrim(v_line->>'description'),
      (v_line->>'quantity')::integer, (v_line->>'rate_paise')::bigint,
      (v_line->>'line_total_paise')::bigint
    );
    v_position := v_position + 1;
  end loop;
  insert into billing_private.audit_events(invoice_id, event_type, actor, details)
  values (v_invoice_id, 'INVOICE_CREATED', p_operator_id::text,
          jsonb_build_object(
            'origin',p_origin,'total_paise',v_total,
            'source_event_key',p_source_event_key
          ));
  return jsonb_build_object(
    'id',v_invoice_id, 'invoiceNumber',v_number,
    'totalPaise',v_total, 'status','UNPAID'
  );
end;
$$;

revoke all on function public.billing_create_invoice(text,date,text,text,jsonb,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.billing_create_invoice(text,date,text,text,jsonb,uuid,text,text)
  to service_role;
commit;
