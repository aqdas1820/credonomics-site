-- Additive hardening. Apply only to the dedicated Staging project during this phase.
-- Historical duplicate notifications require operator review, never automatic deletion.
begin;
do $$ begin
  if exists (select 1 from public.notifications where event_id is not null
             group by user_id, alert_id, event_id having count(*) > 1) then
    raise exception 'Duplicate alert events exist; review them before applying alert_safety. No rows were deleted.';
  end if;
end $$;
create unique index if not exists notifications_alert_event_unique
  on public.notifications(user_id, alert_id, event_id) where event_id is not null;

-- Users may acknowledge their notifications, not rewrite their ownership/content/FK.
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;

-- Existing evaluator expects this reference table; earlier migrations omitted it.
-- No personal information and no required synthetic seed data.
create table if not exists public.ipos (
  slug text primary key,
  company_name text not null,
  open_date date,
  close_date date,
  listing_date date,
  source_url text,
  observed_at timestamptz
);
alter table public.ipos enable row level security;
drop policy if exists ipos_reference_read on public.ipos;
create policy ipos_reference_read on public.ipos for select to anon, authenticated using(true);
revoke all on public.ipos from anon, authenticated;
grant select on public.ipos to anon, authenticated;
grant all on public.ipos to service_role;

alter table public.alerts drop constraint if exists alerts_alert_type_check;
alter table public.alerts add constraint alerts_alert_type_check check(alert_type in
 ('price_above','price_below','percent_rise','percent_fall','52_week_high','52_week_low',
  'volume_spike','event_dividend','event_bonus','event_split','event_rights','event_buyback','event_earnings',
  'ipo_open','ipo_close','ipo_listing'));
alter table public.alerts drop constraint if exists alerts_entity_type_check;
alter table public.alerts add constraint alerts_entity_type_check check(entity_type in ('STOCK','IPO','MUTUAL_FUND'));

create or replace function public.trigger_alert_v2(alert_id uuid, event_dedupe_key text,
 notification_title text, notification_msg text, cooldown_interval interval)
returns boolean language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  claimed public.alerts%rowtype;
  inserted_id uuid;
  evaluated_at timestamptz := now();
begin
  if event_dedupe_key is null or length(trim(event_dedupe_key)) = 0 then
    raise exception 'An event identity is required';
  end if;
  if cooldown_interval is not null and cooldown_interval <= interval '0 seconds' then
    raise exception 'Cooldown must be positive';
  end if;
  -- Serialize concurrent CRON/manual evaluations of the same alert.
  select * into claimed from public.alerts where id = trigger_alert_v2.alert_id for update;
  if not found or claimed.status <> 'active' or
    (claimed.cooldown_until is not null and claimed.cooldown_until > evaluated_at) then
    return false;
  end if;
  insert into public.notifications(user_id, alert_id, type, title, message, channel, event_id, delivery_status)
    values(claimed.user_id, claimed.id, 'alert', notification_title, notification_msg, 'IN_APP', event_dedupe_key, 'SENT')
    on conflict (user_id, alert_id, event_id) where event_id is not null do nothing
    returning id into inserted_id;
  if inserted_id is null then return false; end if;
  update public.alerts set
    status = case when cooldown_interval is null then 'triggered' else 'active' end,
    triggered_at = evaluated_at, last_evaluated_at = evaluated_at, updated_at = evaluated_at,
    trigger_count = trigger_count + 1, dedupe_key = event_dedupe_key,
    cooldown_until = case when cooldown_interval is null then null else evaluated_at + cooldown_interval end
    where id = claimed.id;
  -- Notification and alert are committed together, or neither is committed.
  return true;
end;
$$;
revoke all on function public.trigger_alert_v2(uuid,text,text,text,interval) from public, anon, authenticated;
grant execute on function public.trigger_alert_v2(uuid,text,text,text,interval) to service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;
commit;
