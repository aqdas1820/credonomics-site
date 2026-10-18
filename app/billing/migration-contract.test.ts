import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Static migration-contract checks only. They do NOT replace a real Postgres
// migration, RLS, concurrency or rollback test on the approved CredoNomics DB.
const sql = (filename: string) =>
  readFileSync(join(process.cwd(), 'docs', 'billing', filename), 'utf8')
const schema = sql('012_billing_private_review.sql')
const create = sql('013_invoice_create_rpc_REVIEW_ONLY.sql')
const reconcile = sql('014_slice_settlement_rpc_REVIEW_ONLY.sql')
const reads = sql('015_admin_invoice_read_rpc_REVIEW_ONLY.sql')
const gateway = sql('016_youpi_observation_rpc_REVIEW_ONLY.sql')

describe('private billing migration security contracts', () => {
  it('denies anonymous and authenticated schema access', () => {
    expect(schema).toContain('revoke all on schema billing_private from public, anon, authenticated')
    for (const table of ['invoices', 'invoice_lines', 'bank_credit_evidence', 'audit_events', 'receipts']) {
      expect(schema).toContain('alter table billing_private.' + table + ' enable row level security')
    }
    expect(gateway).toContain('alter table billing_private.youpi_observations enable row level security')
  })
  it('uses hardened SECURITY DEFINER search paths for every admin RPC', () => {
    for (const migration of [create, reconcile, reads, gateway]) {
      expect(migration).toContain('security definer')
      expect(migration).toMatch(/set search_path\s*=\s*pg_catalog,\s*pg_temp/)
      expect(migration).not.toMatch(/set search_path\s*=\s*pg_catalog,\s*public/)
      expect(migration).toContain("coalesce(auth.role(),'') <> 'service_role'")
      expect(migration).toContain('from public, anon, authenticated')
      expect(migration).toContain('to service_role')
    }
  })
  it('allocates invoice numbers in SQL and stores lines plus audit in one transaction', () => {
    expect(create).toContain("nextval('billing_private.invoice_sequence')")
    expect(create).toContain('insert into billing_private.invoice_lines')
    expect(create).toContain('insert into billing_private.audit_events')
    expect(schema).toContain('source_event_key text unique')
  })
  it('serializes bank credit verification and prevents over-credit', () => {
    expect(reconcile).toMatch(/from billing_private\.invoices\s+where id=p_invoice_id for update/i)
    expect(reconcile).toContain('Credit exceeds invoice outstanding')
    expect(schema).toContain('utr text not null unique')
    expect(reconcile).toContain("'BANK_CREDIT_VERIFIED'")
  })
  it('issues PAID receipt snapshots in the same bank-credit transaction only', () => {
    expect(reconcile).toContain("if v_new_status='PAID' then")
    expect(reconcile).toContain('insert into billing_private.receipts')
    expect(schema).toContain('unique references billing_private.invoices')
    expect(schema).toContain('create trigger immutable_verified_receipt')
  })
  it('never lets signed gateway SUCCESS change invoice status or create receipt', () => {
    expect(gateway).toContain("'REVIEW_REQUIRED'")
    expect(gateway).not.toMatch(/^\s*update\s+billing_private\.invoices/im)
    expect(gateway).not.toMatch(/^\s*insert\s+into\s+billing_private\.receipts/im)
    expect(gateway).not.toMatch(/^\s*insert\s+into\s+billing_private\.bank_credit_evidence/im)
    expect(gateway).toContain('unique(payment_id, event)')
    expect(gateway).toContain('raw_sha256 text not null unique')
  })
  it('reads receipt data from the immutable snapshot rather than recomputing status', () => {
    expect(reads).toContain('select r.snapshot into v_snapshot')
    expect(reads).toContain("i.status='PAID'")
  })
})
