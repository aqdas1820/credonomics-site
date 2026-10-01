-- Apply after 20260902_cloud_accounts.sql. Only the service role can evaluate alerts.
create or replace function public.trigger_price_alert(alert_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare claimed public.alerts%rowtype;
begin
  update public.alerts set status = 'triggered', triggered_at = now(), last_evaluated_at = now()
    where id = alert_id and status = 'active' returning * into claimed;
  if not found then return false; end if;
  insert into public.notifications(user_id, alert_id, type, title, message)
    values(claimed.user_id, claimed.id, 'alert', claimed.symbol || ' alert triggered',
      claimed.symbol || ' reached the configured ' || replace(claimed.alert_type, '_', ' ') || ' condition.');
  return true;
end;
$$;
revoke all on function public.trigger_price_alert(uuid) from public, anon, authenticated;
grant execute on function public.trigger_price_alert(uuid) to service_role;
