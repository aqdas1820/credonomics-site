import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = (name: string) => readFileSync(join(process.cwd(), 'docs/billing', name), 'utf8')
const schema = sql('012_billing_private_review.sql')
const create = sql('013_invoice_create_rpc_REVIEW_ONLY.sql')
const settle = sql('014_slice_settlement_rpc_REVIEW_ONLY.sql')
const read = sql('015_admin_invoice_read_rpc_REVIEW_ONLY.sql')
const youpi = sql('016_youpi_observation_rpc_REVIEW_ONLY.sql')
const all = [schema, create, settle, read, youpi]

describe('Billing review-only SQL safety contracts (static, not execution)', () => {
  it('rejects broken PL/pgSQL quoting or duplicated migrations', () => {
    for (const s of all) {
      const open = s.match(/\bas \$\$\n/g) ?? []
      const close = s.match(/\bend;\s*\$\$;/g) ?? []
      expect(open.length).toBeGreaterThan(0)
      expect(open.length).toBe(close.length)
      expect(s).not.toMatch(/\bas \$(?!\$)/)
      expect((s.match(/\bcommit;/g) ?? []).length).toBe(1)
      expect(s.trimEnd().endsWith('commit;')).toBe(true)
    }
    expect((create.match(/create or replace function public\.billing_create_invoice\(/g) ?? []).length).toBe(1)
    expect(create).toContain("p_source_event_key !~ '^[A-Za-z0-9:_-]{8,128}$'")
  })
  it('denies unauthenticated access to private financial tables', () => {
    expect(schema).toContain('revoke all on schema billing_private from public, anon, authenticated')
    for (const table of ['invoices','invoice_lines','bank_credit_evidence','receipts','audit_events']) {
      expect(schema).toContain('alter table billing_private.' + table + ' enable row level security')
    }
    expect(youpi).toContain('alter table billing_private.youpi_observations enable row level security')
  })
  it('requires service role and safe search paths on every RPC', () => {
    for (const s of [create,settle,read,youpi]) {
      expect(s).toContain('security definer')
      expect(s).toMatch(/set search_path\s*=\s*pg_catalog,\s*pg_temp/)
      expect(s).toMatch(/coalesce\(auth\.role\(\),\s*''\)\s*<>\s*'service_role'/)
      expect(s).toContain('from public, anon, authenticated')
      expect(s).toContain('to service_role')
    }
  })
  it('creates exact-price UNPAID invoices and never client-selected paid status', () => {
    expect(create).toContain("nextval('billing_private.invoice_sequence')")
    expect(create).toContain('Invoice sequence exhausted')
    expect(create).toContain('insert into billing_private.invoice_lines')
    expect(create).toContain("'UNPAID'")
    expect(create).toContain('insert into billing_private.audit_events')
  })
  it('locks bank settlement, blocks excess credits, and snapshots PAID once', () => {
    expect(settle).toMatch(/from billing_private\.invoices\s+where id=p_invoice_id for update/i)
    expect(settle).toContain('Credit exceeds invoice outstanding')
    expect(schema).toContain('utr text not null unique')
    expect(settle).toContain("if v_new_status='PAID' then")
    expect(settle).toContain('insert into billing_private.receipts')
    expect(schema).toContain('create trigger immutable_verified_receipt')
    expect(schema).toContain('create trigger immutable_invoice_line')
    expect(schema).toContain('create trigger immutable_bank_credit')
    expect(schema).toContain('create trigger immutable_billing_audit')
    expect(schema).toContain('create trigger immutable_invoice_issuance')
    expect(schema).toContain('new.invoice_number')
    expect(schema).toContain('new.customer_phone_e164')
    expect(schema).toContain('new.total_paise')
    expect(schema).toContain("raise exception 'Issued invoice details cannot be rewritten'")
    expect(schema).toContain("raise exception 'Billing financial evidence is append-only'")
  })
  it('prevents YouPI SUCCESS from marking invoices PAID or crediting Slice', () => {
    expect(youpi).toContain("'REVIEW_REQUIRED'")
    expect(youpi).not.toMatch(/^\s*update\s+billing_private\.invoices/im)
    expect(youpi).not.toMatch(/^\s*insert\s+into\s+billing_private\.bank_credit_evidence/im)
    expect(youpi).not.toMatch(/^\s*insert\s+into\s+billing_private\.receipts/im)
    expect(youpi).toContain('unique(payment_id, event)')
    expect(youpi).toContain('raw_sha256 text not null unique')
    expect(youpi).toContain('o.payment_id = p_payment_id and o.event = p_event')
    expect(youpi).toContain('o.invoice_id = v_invoice.id and o.order_id = p_order_id')
    expect(youpi).toContain('o.utr is not distinct from p_utr')
    expect(youpi).toContain('o.raw_sha256 = p_raw_sha256')
    expect(youpi).toContain("raise exception 'Conflicting gateway observation replay' using errcode='23505'")
    expect(read).toContain('select r.snapshot into v_snapshot')
  })
})
