import { expect, test } from '@playwright/test'

for (const width of [320, 375, 430]) {
  test(`mobile header and restored orbit fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/')
    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: /Research Desk/ })).toBeHidden()
    await expect(header.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    await expect(page.getByRole('button', { name: /Pause animation|Resume animation/ })).toHaveCount(0)
    const orbit = page.locator('[data-cm-hero] [class*="orbitOuter"]')
    const initial = await orbit.evaluate(node => getComputedStyle(node).transform)
    await expect.poll(() => orbit.evaluate(node => getComputedStyle(node).transform)).not.toBe(initial)
  })
}

test('desktop orbit continues beyond its entrance without a pause control', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Pause animation|Resume animation/ })).toHaveCount(0)
  const orbit = page.locator('[data-cm-hero] [class*="orbitOuter"]')
  const first = await orbit.evaluate(node => getComputedStyle(node).transform)
  await expect.poll(() => orbit.evaluate(node => getComputedStyle(node).transform)).not.toBe(first)
})
