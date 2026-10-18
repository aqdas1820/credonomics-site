import { test, expect } from '@playwright/test'
const id = '12345678-1234-4234-8234-123456789012'
test('disabled billing APIs and PDFs return private denials', async ({ request }) => {
  for (const path of ['/api/billing/admin/invoices', `/api/billing/admin/invoices/${id}`, `/api/billing/admin/invoices/${id}/documents/invoice`, `/api/billing/admin/invoices/${id}/documents/receipt`]) {
    const response = await request.get(path)
    expect(response.status()).toBe(404); expect(response.headers()['cache-control']).toContain('no-store')
  }
  // Middleware masks every disabled billing endpoint before route handlers run.
  expect((await request.post('/api/billing/admin/invoices', { data: {} })).status()).toBe(404)
  expect((await request.post(`/api/billing/admin/invoices/${id}/verify-credit`, { data: {} })).status()).toBe(404)
  expect((await request.post(`/api/billing/admin/invoices/${id}/documents/invoice`)).status()).toBe(404)
})
test('anonymous browser cannot view invoice or receipt documents', async ({ page }) => {
  for (const suffix of ['', '/receipt']) {
    const response = await page.goto(`/billing/invoices/${id}${suffix}`)
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('button', { name: 'Download archived PDF' })).toHaveCount(0)
  }
})
test('framework upgrade preserves dynamic query and slug pages', async ({ request }) => {
  for (const path of ['/search?q=synthetic', '/ipo?view=upcoming', '/cards/compare?category=cashback', '/research/articles/effective-credit-card-reward-rate']) {
    expect((await request.get(path)).status()).toBe(200)
  }
})
