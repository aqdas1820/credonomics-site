import { test, expect } from '@playwright/test'
test('market and IPO pages show data or an honest unavailable state', async ({ page }) => {
  for (const route of ['/markets', '/ipo']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.locator('main').first()).not.toContainText(/NaN|Infinity/)
  }
})
test('stock chart intervals finish loading with data or an unavailable state', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/stocks/nse/RELIANCE')
  for (const range of ['1W', '1M', '3M', '6M', '1Y', '3Y', '5Y']) {
    await page.getByRole('button', { name: range, exact: true }).click()
    await expect(page.getByText(/Loading price history/)).not.toBeVisible({ timeout: 30_000 })
    await expect.poll(async () => await page.getByRole('img', { name: 'Historical candlestick price chart with volume' }).isVisible() || await page.getByText(/Chart data is unavailable|No trading-session data/).isVisible()).toBe(true)
  }
})
