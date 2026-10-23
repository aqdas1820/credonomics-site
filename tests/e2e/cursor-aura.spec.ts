import { expect, test } from '@playwright/test'

test('research hero remains usable without a continuous pointer decoration', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-cm-cursor-aura]')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await page.locator('[data-cm-hero]').getByRole('link', { name: /Explore research/ }).click()
  await expect(page).toHaveURL(/\/research\/?$/)
})

test('reduced motion leaves all hero content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('[data-cm-hero] h1')).toBeVisible()
  await expect(page.locator('[data-cm-hero] h1')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('[data-cm-cursor-aura]')).toHaveCount(0)
})
