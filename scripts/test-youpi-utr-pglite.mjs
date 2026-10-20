// Disposable in-memory PostgreSQL/WASM contract checks. NOT a native concurrency,
// hosted Supabase/Auth, bank-credit or production acceptance test.
// Tooling only: install @electric-sql/pglite@0.5.10 in a temporary directory and
// set BILLING_PGLITE_MODULE to its dist/index.js absolute path. No cloud secrets.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const { PGlite } = await import(process.env.BILLING_PGLITE_MODULE || '@electric-sql/pglite');
const actor = '12345678-1234-4234-8234-123456789012';
const merchant = '22222222-2222-4222-8222-222222222222';
const migration = name => fs.readFile(new URL('../docs/billing/' + name, import.meta.url), 'utf8');
const claims = await migration('017_youpi_utr_claims_REVIEW_ONLY.sql');
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log('PASS ' + name); };
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create function auth.role() returns text language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
    grant usage on schema auth to anon,authenticated,service_role;`);
  for (const name of ['012_billing_private_review.sql','013_invoice_create_rpc_REVIEW_ONLY.sql',
    '014_slice_settlement_rpc_REVIEW_ONLY.sql','015_admin_invoice_read_rpc_REVIEW_ONLY.sql',
    '016_youpi_observation_rpc_REVIEW_ONLY.sql','PHASE28_LINK_LEDGER_REVIEW_ONLY.sql']) await db.exec(await migration(name));
  return db;
}
const db = await setup();
async function rpc(name, args) {
  await db.exec("set role service_role; set request.jwt.claim.role='service_role';");
  try { return (await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as value`, args)).rows[0].value; }
  finally { await db.exec('reset role'); }
}
const issue = () => rpc('billing_create_invoice', ['Synthetic Customer','2026-10-20',null,'',JSON.stringify([
  { description:'Synthetic service',quantity:1,rate_paise:100,line_total_paise:100 }]),actor]);
const observe = (invoice, payment, utr, event='SUCCESS') => rpc('billing_record_youpi_observation',
  [payment,invoice.invoiceNumber,event,100,utr,randomUUID().replaceAll('-','').repeat(2)]);
try {
  const first = await issue(), second = await issue(), payment = randomUUID();
  const utr = randomUUID().replaceAll('-','').toUpperCase();
  await observe(first,payment,utr,'FAILED');
  await test('backfills existing reference claims without changing observations', async () => {
    await db.exec(claims);
    const row = (await db.query('select * from billing_private.youpi_utr_claims')).rows[0];
    assert.equal(row.utr,utr); assert.equal(row.payment_id,payment); assert.equal(row.invoice_id,first.id);
  });
  await test('same payment may report another event using its bound reference', async () => {
    assert.equal((await observe(first,payment,utr)).recorded,true);
  });
  await test('same reference cannot bind a different payment or invoice', async () => {
    await assert.rejects(()=>observe(first,randomUUID(),utr),e=>e.code==='23505');
    await assert.rejects(()=>observe(second,randomUUID(),utr),e=>e.code==='23505');
  });
  await test('same payment cannot claim a second reference', async () => {
    await assert.rejects(()=>observe(first,payment,'DIFFERENTUTR001','EXPIRED'),e=>e.code==='23505');
  });
  await test('claims reject direct reads from all API roles', async () => {
    for (const role of ['anon','authenticated','service_role']) {
      await db.exec('set role '+role);
      try { await assert.rejects(()=>db.query('select * from billing_private.youpi_utr_claims'),e=>e.code==='42501'); }
      finally { await db.exec('reset role'); }
    }
  });
  await test('claim mutation and truncate are rejected even for owner', async () => {
    for (const sql of ["update billing_private.youpi_utr_claims set utr='CHANGEDUTR01'",
      'delete from billing_private.youpi_utr_claims','truncate billing_private.youpi_utr_claims']) {
      await assert.rejects(()=>db.exec(sql),/append-only/);
    }
  });
  await test('failed observation insert rolls its reference claim back', async () => {
    const raw = (await db.query('select raw_sha256 from billing_private.youpi_observations limit 1')).rows[0].raw_sha256;
    await assert.rejects(()=>rpc('billing_record_youpi_observation',[randomUUID(),second.invoiceNumber,'SUCCESS',100,'ROLLBACKUTR001',raw]),e=>e.code==='23505');
    assert.equal((await db.query("select count(*)::int as n from billing_private.youpi_utr_claims where utr='ROLLBACKUTR001'")).rows[0].n,0);
  });
  await test('linked invoice journey remains unpaid after signed-success observation', async () => {
    const invoice = await issue(), pid=randomUUID(), digest='c'.repeat(64);
    assert.equal((await rpc('billing_youpi_link_reserve',[invoice.id,merchant,actor])).decision,'CREATE');
    assert.equal(await rpc('billing_youpi_link_complete',[invoice.id,merchant,pid,digest]),true);
    const args=[invoice.id,merchant,pid,'SUCCESS',100,'LINKEDTESTUTR001',digest];
    assert.equal((await rpc('billing_record_youpi_link_observation',args)).recorded,true);
    assert.equal((await rpc('billing_record_youpi_link_observation',args)).duplicate,true);
    const state=await rpc('billing_get_invoice',[invoice.id]);
    assert.equal(state.status,'UNPAID'); assert.equal(state.paidPaise,0);
    await assert.rejects(()=>rpc('billing_get_receipt',[invoice.id]));
    await assert.rejects(()=>rpc('billing_record_youpi_link_observation',[invoice.id,randomUUID(),pid,'SUCCESS',100,'LINKEDTESTUTR001',digest]));
  });
  await test('conflicting historical references abort migration without deleting data', async () => {
    const old = await setup();
    try {
      // Seed only the minimal synthetic canonical invoices and legacy observations.
      await old.query(`insert into billing_private.invoices(id,invoice_number,customer_name,issued_on,total_paise)
        values($1,'LEGACY-A','Synthetic','2026-10-20',100),($2,'LEGACY-B','Synthetic','2026-10-20',100)`,[randomUUID(),randomUUID()]);
      await old.exec(`insert into billing_private.youpi_observations(invoice_id,payment_id,order_id,event,amount_paise,utr,raw_sha256)
        select id,gen_random_uuid(),invoice_number,'SUCCESS',100,'CONFLICTUTR001',repeat(case invoice_number when 'LEGACY-A' then 'a' else 'b' end,64)
        from billing_private.invoices;`);
      await assert.rejects(()=>old.exec(claims),e=>e.code==='23505'); await old.exec('rollback');
      assert.equal((await old.query('select count(*)::int as n from billing_private.youpi_observations')).rows[0].n,2);
      assert.equal((await old.query("select to_regclass('billing_private.youpi_utr_claims') as t")).rows[0].t,null);
    } finally { await old.close(); }
  });
  console.log(JSON.stringify({passed,engine:(await db.query('select version() as version')).rows[0].version,
    nativeConcurrencyTested:false,hostedDatabaseAccess:false,bankCreditVerified:false}));
} finally { await db.close(); }
