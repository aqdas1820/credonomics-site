import { test, expect } from '@playwright/test'

const approved = process.env.BILLING_STAGING_E2E_APPROVED === 'jvpiulmcjjnsgozgqgzw' && !!process.env.BILLING_STAGING_E2E_ORIGIN
const id = process.env.BILLING_STAGING_SYNTHETIC_INVOICE_ID
test.skip(!approved, 'Requires separate exact-project E2E approval and dedicated staging origin')
test.beforeEach(() => {
  if (id && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) throw new Error('Synthetic invoice UUID required')
})

test('anonymous list and guessed document routes disclose no invoice', async ({ request }) => {
  const urls = ['/api/billing/admin/invoices', '/api/billing/admin/invoices/invalid', '/api/billing/admin/invoices/invalid/documents/invoice']
  if (id) urls.push(`/api/billing/admin/invoices/${id}`, `/api/billing/admin/invoices/${id}/documents/receipt`)
  for (const path of urls) {
    const response = await request.get(path)
    expect([403, 404]).toContain(response.status())
    expect(response.headers()['cache-control']).toContain('no-store')
  }
})
test('cross-origin invoice and archive creation are refused', async ({ request }) => {
  for (const path of ['/api/billing/admin/invoices', ...(id ? [`/api/billing/admin/invoices/${id}/documents/invoice`, `/api/billing/admin/invoices/${id}/verify-credit`] : [])]) {
    const response = await request.post(path, { headers: { origin: 'https://attacker.invalid' }, data: {} })
    expect([403, 404, 503]).toContain(response.status())
  }
})
test('allowlisted admin retrieves exact archived bytes repeatedly', async ({ playwright }) => {
  test.skip(!id || !process.env.BILLING_STAGING_ADMIN_STATE, 'Requires owner-local admin state and synthetic invoice')
  const context = await playwright.request.newContext({ baseURL: process.env.BILLING_STAGING_E2E_ORIGIN, storageState: process.env.BILLING_STAGING_ADMIN_STATE })
  try {
    const a = await context.get(`/api/billing/admin/invoices/${id}/documents/invoice`)
    const b = await context.get(`/api/billing/admin/invoices/${id}/documents/invoice`)
    expect(a.status()).toBe(200); expect(b.status()).toBe(200)
    expect(a.headers()['content-type']).toBe('application/pdf')
    const { createHash } = await import('node:crypto')
    const ah = createHash('sha256').update(await a.body()).digest('hex')
    const bh = createHash('sha256').update(await b.body()).digest('hex')
    expect(ah === bh && ah === a.headers()['x-document-sha256']).toBe(true)
  } finally { await context.dispose() }
})
test('ordinary and second-customer sessions cannot cross into admin invoice/archive access', async ({ playwright }) => {
  test.skip(!id || !process.env.BILLING_STAGING_NONADMIN_STATE, 'Requires owner-local nonadmin state and synthetic invoice')
  const context = await playwright.request.newContext({ baseURL: process.env.BILLING_STAGING_E2E_ORIGIN, storageState: process.env.BILLING_STAGING_NONADMIN_STATE })
  try {
    for (const suffix of ['', '/documents/invoice', '/documents/receipt']) {
      expect((await context.get(`/api/billing/admin/invoices/${id}${suffix}`)).status()).toBe(403)
    }
  } finally { await context.dispose() }
})
