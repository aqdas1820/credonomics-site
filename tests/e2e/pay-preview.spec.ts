import { test, expect } from '@playwright/test'

const sizes = [
  { width: 320, height: 720 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 960, height: 900 },
  { width: 1440, height: 900 },
]

for (const theme of ['dark', 'light'] as const) {
  for (const size of sizes) {
    test(`payment preview is readable without horizontal overflow at ${size.width}px (${theme})`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.addInitScript((mode) => localStorage.setItem('credonomics-theme', mode), theme)
      const pageErrors: string[] = []
      page.on('pageerror', (error) => pageErrors.push(error.message))
      const response = await page.goto('/pay')
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { name: /invoice payments, with verification built in/i })).toBeVisible()
      await expect(page.getByText(/not accepting payments/i)).toBeVisible()
      await expect(page.getByText(/automatic settlement/i)).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
      expect(pageErrors).toEqual([])
    })
  }
}

test('payment preview forbids checkout initiation and search indexing', async ({ page }) => {
  await page.goto('/pay')
  const robots = await page.locator('meta[name="robots"]').getAttribute('content')
  expect(robots).toContain('noindex')
  await expect(page.getByRole('link', { name: /contact credonomics/i })).toHaveAttribute('href', '/contact')
  await expect(page.locator('form')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /pay now|scan qr|continue to checkout|create payment/i })).toHaveCount(0)
  await expect(page.getByText(/no payment session, otp request or upi transaction can be started/i)).toBeVisible()
})
