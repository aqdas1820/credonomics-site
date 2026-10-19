import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const routes = ['/', '/cards', '/cards/all', '/cards/compare?category=cashback', '/ipo', '/ipo?view=upcoming', '/research', '/search?q=credit', '/stocks/search', '/account', '/pay']
for (const width of [320, 375, 768, 1440]) {
  for (const route of routes) test(`production ${route} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    // No third-party browser connections are needed to prove local route preservation.
    await page.route('**/*', request => new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort())
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await expect(page.locator('a[href="/personal-testing"]')).toHaveCount(0)
    if (route === '/pay') {
      await expect(page.getByText(/not accepting payments/i)).toBeVisible()
      await expect(page.locator('form')).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })
}
test('production intelligence files are served exactly and private workspace remains disabled', async ({ request }) => {
  for (const path of ['/data/cards/auto-catalog.json', '/data/cards/review-queue.json', '/data/ipo/discovery.json', '/data/ipo/market-master.json']) {
    const response = await request.get(path); expect(response.status()).toBe(200)
    expect(await response.json()).toEqual(JSON.parse(await readFile('public' + path, 'utf8')))
  }
  for (const path of ['/personal-testing', '/api/personal-testing', '/api/personal-testing/session', '/billing', '/api/billing/admin/invoices']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404); expect(response.headers()['cache-control']).toContain('no-store')
  }
})
