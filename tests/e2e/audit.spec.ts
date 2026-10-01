import { test, expect } from '@playwright/test'
const unavailable = { data: null, metadata: { availability: 'unavailable', asOf: null }, error: { message: 'Data temporarily unavailable.' } }
test.beforeEach(async ({ page }) => {
  await page.route('**/api/stocks/**', route => route.request().url().includes('/search?') ? route.continue() : route.fulfill({ json: unavailable, status: 503 }))
  await page.route('**/api/watchlist/quotes', route => route.fulfill({ json: unavailable, status: 503 }))
  await page.route('**/api/alerts/evaluate*', route => route.fulfill({ json: unavailable, status: 503 }))
})
test('saved device stocks and alerts survive navigation', async ({ page }) => {
  await page.goto('/stocks/nse/RELIANCE')
  await page.getByRole('button', { name: 'Add to Watchlist', exact: true }).click()
  await page.getByRole('button', { name: 'My Watchlist', exact: true }).click()
  await expect(page.getByRole('button', { name: 'In Watchlist', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Set Alert', exact: true }).click()
  await page.getByLabel('Alert target', { exact: true }).fill('1500')
  await page.getByRole('button', { name: 'Create Alert', exact: true }).click()
  await page.goto('/watchlist')
  await expect(page.getByRole('link', { name: /RELIANCE/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Remove RELIANCE', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No stocks in this watchlist yet.' })).toBeVisible()
  await page.goto('/alerts')
  await expect(page.getByText(/^Target.*1,500/)).toBeVisible()
  await page.getByRole('button', { name: 'Pause alert', exact: true }).click()
  await page.getByRole('button', { name: 'Paused', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Enable alert', exact: true })).toBeVisible()
})
test('failed history is an unavailable state and never an invented fund', async ({ page, request }) => {
  await page.goto('/stocks/nse/RELIANCE')
  await expect(page.getByText('Chart data is unavailable for this interval.')).toBeVisible()
  await page.goto('/mutual-funds/INF000000000')
  await expect(page.getByRole('heading', { name: 'Scheme data unavailable' })).toBeVisible()
  await expect(page.getByText('CredoNomics Alpha Equity Fund')).toHaveCount(0)
  const response = await request.get('/api/mf/portfolio?isin=INF000000000')
  expect(response.status()).toBe(503)
  expect((await response.json()).data).toBeNull()
})
test('daily candles expose an OHLC tooltip and latest timeframe wins', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const candles = (close: number) => Array.from({ length: 12 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}T09:15:00+05:30`, open: close - 1, high: close + 2, low: close - 2, close, volume: 100 }))
  await page.route('**/api/stocks/history?**', async route => {
    const range = new URL(route.request().url()).searchParams.get('range')
    if (range === '1W') await new Promise(resolve => setTimeout(resolve, 500))
    await route.fulfill({ json: { data: candles(range === '1M' ? 222.45 : 111.25), metadata: { availability: 'recent', asOf: '2026-09-12' } } }).catch(() => {})
  })
  await page.goto('/stocks/nse/RELIANCE')
  await page.getByRole('button', { name: '1W', exact: true }).click()
  await page.getByRole('button', { name: '1M', exact: true }).click()
  const chart = page.getByRole('img', { name: 'Historical candlestick price chart with volume' })
  await expect(chart).toBeVisible()
  await expect(page.locator('[class*="chartTooltip"]')).toContainText('222.45')
  const box = await chart.boundingBox()
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.locator('[class*="chartTooltip"]')).toContainText('222.45')
  expect(errors).toEqual([])
})
test('auth callback rejects external destinations and shows a login error', async ({ page, request }) => {
  const response = await request.get('/auth/callback?next=https://evil.example', { maxRedirects: 0 })
  expect(response.headers().location).toContain('/login?error=')
  expect(response.headers().location).not.toContain('evil.example')
  await page.goto('/login?error=Invalid_Auth_Code&next=/pricing')
  await expect(page.getByText('Sign-in could not be completed. Please try again.')).toBeVisible()
  await expect(page.getByLabel('Email Address', { exact: true })).toBeVisible()
})
test('calculator query parameters cannot produce NaN or Infinity', async ({ page }) => {
  await page.goto('/tools/cashback-calculator?spend=Infinity&rate=NaN&fee=-5')
  await expect(page.locator('main').first()).not.toContainText(/NaN|Infinity/)
})
test('key layouts fit narrow phones through large desktops', async ({ page }) => {
  test.setTimeout(120_000)
  for (const route of ['/login', '/pricing', '/watchlist', '/cards/compare', '/stocks/nse/RELIANCE']) {
    await page.goto(route)
    for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${route} at ${width}px`).toBeLessThanOrEqual(1)
    }
  }
})
