create extension if not exists pgcrypto;

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,email text,display_name text,avatar_url text,created_at timestamptz not null default now());
create table public.watchlists (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null check(char_length(name) between 1 and 40),position integer not null default 0 check(position between 0 and 100),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.watchlist_items (id uuid primary key default gen_random_uuid(),watchlist_id uuid not null references public.watchlists(id) on delete cascade,instrument_key text not null,symbol text not null,exchange text not null check(exchange in ('NSE','BSE')),company_name text not null,created_at timestamptz not null default now(),unique(watchlist_id,instrument_key));
create table public.alerts (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,instrument_key text not null,symbol text not null,exchange text not null check(exchange in ('NSE','BSE')),company_name text not null,alert_type text not null check(alert_type in ('price_above','price_below','percent_rise','percent_fall','52_week_high','52_week_low')),threshold numeric,status text not null default 'active' check(status in ('active','paused','triggered')),created_at timestamptz not null default now(),triggered_at timestamptz,last_evaluated_at timestamptz);
create table public.notifications (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,alert_id uuid not null references public.alerts(id) on delete cascade,type text not null default 'alert',title text not null,message text not null,created_at timestamptz not null default now(),read_at timestamptz);
create index watchlists_user_position_idx on public.watchlists(user_id,position);
create index watchlist_items_list_idx on public.watchlist_items(watchlist_id);
create index watchlist_items_instrument_idx on public.watchlist_items(instrument_key);
create index alerts_user_status_idx on public.alerts(user_id,status);
create index alerts_active_evaluation_idx on public.alerts(status,last_evaluated_at) where status='active';
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);

alter table public.profiles enable row level security;alter table public.watchlists enable row level security;alter table public.watchlist_items enable row level security;alter table public.alerts enable row level security;alter table public.notifications enable row level security;
create policy profiles_own on public.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy watchlists_own on public.watchlists for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy watchlist_items_own on public.watchlist_items for all to authenticated using(exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=(select auth.uid()))) with check(exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=(select auth.uid())));
create policy alerts_own on public.alerts for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy notifications_own on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
revoke all on public.profiles,public.watchlists,public.watchlist_items,public.alerts,public.notifications from anon;
grant select,insert,update,delete on public.profiles,public.watchlists,public.watchlist_items,public.alerts to authenticated;
grant select,update on public.notifications to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id,email,display_name,avatar_url) values(new.id,new.email,new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'avatar_url');insert into public.watchlists(user_id,name,position) values(new.id,'My Watchlist',0);return new;end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
