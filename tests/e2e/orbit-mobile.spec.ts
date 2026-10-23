import { expect, test } from '@playwright/test'

for (const width of [320, 375, 430]) {
  test(`mobile header and restored orbit fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/')
    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: /Research Desk/ })).toBeHidden()
    await expect(header.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    const pause = page.getByRole('button', { name: 'Pause animation' })
    await pause.click()
    await expect(page.locator('[data-cm-hero]')).toHaveAttribute('data-motion-paused', 'true')
    await page.getByRole('button', { name: 'Resume animation' }).click()
    await expect(page.locator('[data-cm-hero]')).toHaveAttribute('data-motion-paused', 'false')
  })
}
