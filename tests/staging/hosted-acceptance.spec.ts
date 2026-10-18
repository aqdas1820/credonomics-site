import { test, expect } from '@playwright/test'
import { createHash } from 'node:crypto'

// Additional READ-ONLY acceptance. No account creation, archive creation or payment writes.
// Deliberately separate approval from the older smoke suite. Never upload local session files.
const ref = 'jvpiulmcjjnsgozgqgzw'
const approved = process.env.BILLING_HOSTED_ACCEPTANCE_APPROVED === ref
const api = `https://${ref}.supabase.co`
const id = process.env.BILLING_STAGING_SYNTHETIC_INVOICE_ID
const admin = process.env.BILLING_STAGING_ADMIN_STATE
const ordinary = process.env.BILLING_STAGING_NONADMIN_STATE
const publishable = process.env.BILLING_STAGING_PUBLISHABLE_KEY
const adminJwt = process.env.BILLING_STAGING_ADMIN_JWT
const ordinaryJwt = process.env.BILLING_STAGING_NONADMIN_JWT
const bucket = process.env.BILLING_STAGING_ARCHIVE_BUCKET
const expectedHash = process.env.BILLING_STAGING_SYNTHETIC_PDF_SHA256

if (approved && (process.env.BILLING_STAGING_E2E_APPROVED !== ref || !process.env.BILLING_STAGING_E2E_ORIGIN ||
    process.env.BILLING_STAGING_SUPABASE_URL !== api || !admin || !ordinary || !publishable || !adminJwt || !ordinaryJwt ||
    !id || !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(id) ||
    !bucket || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket) || !expectedHash || !/^[a-f\d]{64}$/.test(expectedHash))) {
  throw new Error('Hosted acceptance prerequisites incomplete; no remote calls made')
}
test.skip(!approved, 'Requires separate exact-project hosted acceptance approval and all synthetic fixture prerequisites')

test('real Auth validates two distinct identities and trusted admin metadata', async ({ playwright }) => {
  const identities: Array<{ id?: string; app_metadata?: { billing_admin?: unknown } }> = []
  for (const jwt of [adminJwt, ordinaryJwt]) {
    const context = await playwright.request.newContext({ baseURL: api,
      extraHTTPHeaders: { apikey: publishable!, Authorization: `Bearer ${jwt}` } })
    try {
      const response = await context.get('/auth/v1/user')
      expect(response.status() === 200, 'Synthetic identity must be currently verified by hosted Auth').toBe(true)
      identities.push(await response.json())
    } finally { await context.dispose() }
  }
  // Boolean assertions prevent identity/claim values from entering failure output.
  expect(typeof identities[0].id === 'string' && identities[0].id !== identities[1].id).toBe(true)
  expect(identities[0].app_metadata?.billing_admin === true).toBe(true)
  expect(identities[1].app_metadata?.billing_admin !== true).toBe(true)
})

test('admin archive matches independently recorded synthetic hash and fresh session cannot cross access boundary', async ({ playwright }) => {
  const path = `/api/billing/admin/invoices/${id}/documents/invoice`
  const allowed = await playwright.request.newContext({ baseURL: process.env.BILLING_STAGING_E2E_ORIGIN, storageState: admin })
  const denied = await playwright.request.newContext({ baseURL: process.env.BILLING_STAGING_E2E_ORIGIN, storageState: ordinary })
  try {
    // Positive baseline prevents disabled flags/missing migrations from falsely passing negative cases.
    for (let i = 0; i < 2; i++) {
      const response = await allowed.get(path)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('application/pdf')
      expect(response.headers()['cache-control']).toContain('no-store')
      expect(response.headers()['content-disposition']?.startsWith('attachment;')).toBe(true)
      const bytes = await response.body()
      const hash = createHash('sha256').update(bytes).digest('hex')
      expect(hash === expectedHash && hash === response.headers()['x-document-sha256']).toBe(true)
    }
    expect((await denied.get(path)).status()).toBe(403)
    expect((await allowed.get(`/api/billing/admin/invoices/${id}/documents/invalid`)).status()).toBe(404)
  } finally { await allowed.dispose(); await denied.dispose() }
})

test('private archive envelope cannot be fetched publicly, anonymously or by ordinary user', async ({ playwright }) => {
  const context = await playwright.request.newContext({ baseURL: api })
  try {
    // Only an owner-certified SYNTHETIC archived object may be addressed. Never enumerate/list a bucket.
    const object = `${bucket}/${id}/invoice-v1.json`
    for (const [route, headers] of [
      [`/storage/v1/object/public/${object}`, {}],
      [`/storage/v1/object/${object}`, { apikey: publishable! }],
      [`/storage/v1/object/${object}`, { apikey: publishable!, Authorization: `Bearer ${ordinaryJwt}` }],
    ] as const) {
      const response = await context.get(route, { headers })
      expect([400, 401, 403, 404].includes(response.status()), 'Direct archive access must be denied').toBe(true)
    }
  } finally { await context.dispose() }
})
