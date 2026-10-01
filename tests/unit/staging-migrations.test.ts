import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

// Embedded PostgreSQL only: no connection URL, credentials, remote clients or real users.
const db = new PGlite({ extensions: { pgcrypto } })
const user = '00000000-0000-4000-8000-000000000001'
const alertId = '00000000-0000-4000-8000-000000000002'
const migrationDir = resolve('supabase/migrations')
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to service_role;`)
  for (const name of readdirSync(migrationDir).filter(n => n.endsWith('.sql')).sort()) await db.exec(readFileSync(resolve(migrationDir, name), 'utf8'))
}, 60_000)
afterAll(async () => { await db.close() })

describe('clean staging migrations (isolated PostgreSQL)', () => {
  it('creates all required RLS tables with no user seeds', async () => {
    const r = await db.query<{ relname: string; relrowsecurity: boolean }>("select relname, relrowsecurity from pg_class where relnamespace='public'::regnamespace and relkind='r' order by relname")
    expect(r.rows.map(r => r.relname)).toEqual(['alerts','ipos','notifications','profiles','watchlist_items','watchlists'])
    expect(r.rows.every(r => r.relrowsecurity)).toBe(true)
    expect((await db.query('select * from auth.users')).rows).toHaveLength(0)
  })
  it('additive hardening is repeatable', async () => { await db.exec(readFileSync(resolve(migrationDir, '20260930_alert_safety.sql'), 'utf8')) })
  it('has no authenticated/anonymous execution grant on privileged RPCs', async () => {
    const result = await db.query<{ allowed: boolean }>(`select has_function_privilege(role, fn, 'execute') as allowed
      from unnest(array['anon','authenticated']) role cross join unnest(array[
      'public.trigger_price_alert(uuid)', 'public.trigger_alert_v2(uuid,text,text,text,interval)', 'public.handle_new_user()']) fn`)
    expect(result.rows.every(r => !r.allowed)).toBe(true)
  })
  it('notification content, ownership and foreign key are not user-updatable', async () => {
    const result = await db.query<{ field: string; allowed: boolean }>(`select field, has_column_privilege('authenticated','public.notifications',field,'update') as allowed
      from unnest(array['read_at','user_id','alert_id','title','message','event_id']) field`)
    expect(result.rows.filter(r => r.allowed).map(r => r.field)).toEqual(['read_at'])
  })
  it('signup trigger creates a profile and default watchlist for one synthetic local fixture', async () => {
    await db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,'fixture@example.invalid','{}')", [user])
    expect((await db.query('select id from public.profiles where id=$1', [user])).rows).toHaveLength(1)
    expect((await db.query('select id from public.watchlists where user_id=$1', [user])).rows).toHaveLength(1)
    await db.query("insert into public.alerts(id,user_id,instrument_key,symbol,exchange,company_name,alert_type,threshold) values($1,$2,'NSE_EQ|INE467B01029','TCS','NSE','Fixture','price_above',100)", [alertId, user])
  })
  it('atomic RPC deduplicates repeated events even after rearm and cooldown expiry', async () => {
    const trigger = (event: string, cooldown: string | null = null) => db.query<{ claimed: boolean }>('select public.trigger_alert_v2($1,$2,$3,$4,$5::interval) as claimed', [alertId, event, 'Fixture', 'Synthetic in-memory test', cooldown])
    expect((await trigger('event-1', '1 day')).rows[0].claimed).toBe(true)
    expect((await trigger('event-2', '1 day')).rows[0].claimed).toBe(false) // cooldown
    await db.query("update public.alerts set cooldown_until=now()-interval '1 second', status='active' where id=$1", [alertId])
    expect((await trigger('event-1')).rows[0].claimed).toBe(false) // dedupe survives expiry
    expect((await trigger('event-2')).rows[0].claimed).toBe(true)
    expect((await db.query('select id from public.notifications')).rows).toHaveLength(2)
    expect((await db.query('select trigger_count from public.alerts')).rows[0]).toEqual({ trigger_count: 2 })
  })
  it('failed notification insert leaves alert state/count unchanged', async () => {
    await db.query("update public.alerts set status='active',cooldown_until=null where id=$1", [alertId])
    await expect(db.query('select public.trigger_alert_v2($1,$2,$3,$4,null)', [alertId, 'event-failure', null, 'fixture'])).rejects.toThrow()
    expect((await db.query('select status,trigger_count from public.alerts')).rows[0]).toEqual({ status: 'active', trigger_count: 2 })
    expect((await db.query('select id from public.notifications')).rows).toHaveLength(2)
  })
  it('refuses absent identity or non-positive cooldown', async () => {
    await expect(db.query("select public.trigger_alert_v2($1,null,'x','x',null)", [alertId])).rejects.toThrow('identity')
    await expect(db.query("select public.trigger_alert_v2($1,'x','x','x',interval '0 seconds')", [alertId])).rejects.toThrow('positive')
  })
})
