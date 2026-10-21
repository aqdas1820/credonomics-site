import { expect, test } from '@playwright/test'

test('welcome sequence presents brand, headline, cards and working navigation', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('[data-cm-hero]')
  const brand = hero.locator('[data-cm-welcome]')
  await expect(hero).toBeVisible()
  await expect(brand).toBeVisible()
  await expect(brand.getByText('CREDONOMICS')).toBeVisible()
  await expect(hero.getByRole('heading', { name: /Financial intelligence,/ })).toBeVisible()
  await expect(hero.getByRole('link', { name: /Explore research/ })).toHaveAttribute('href', '/research')
  await expect(hero.getByRole('link', { name: /Open financial tools/ })).toHaveAttribute('href', '/tools')
  await expect(hero.getByRole('link', { name: /Understand the why/ })).toHaveAttribute('href', '/research')
  await expect(hero.getByRole('link', { name: /Study the context/ })).toHaveAttribute('href', '/ipo')
  await expect(hero.getByRole('link', { name: /Make the math clear/ })).toHaveAttribute('href', '/tools')
  const decor = hero.locator('[aria-hidden="true"]')
  expect(await decor.count()).toBeGreaterThan(2)
  await expect(page.getByText('Live index feed unavailable')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Support CredoNomics' })).toBeAttached()
})

test('welcome animation plays only visually and does not block pointer interaction', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('[data-cm-hero]')
  const brand = hero.locator('[data-cm-welcome]')
  const animationName = await brand.evaluate(element => getComputedStyle(element).animationName)
  expect(animationName).toContain('cmWelcomeBrand')
  await expect(hero.locator('[aria-hidden="true"]').first()).toBeAttached()
  await hero.getByRole('link', { name: /Explore research/ }).click()
  await expect(page).toHaveURL(/\/research\/?$/)
})

test('reduced-motion visitors receive immediately visible non-animated content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const hero = page.locator('[data-cm-hero]')
  await expect(hero.locator('[data-cm-welcome]')).toHaveCSS('animation-name', 'none')
  await expect(hero.getByRole('heading', { name: /Financial intelligence,/ })).toHaveCSS('animation-name', 'none')
  await expect(hero.getByRole('heading', { name: /Financial intelligence,/ })).toBeVisible()
  await expect(hero.getByRole('link', { name: /Open financial tools/ })).toBeVisible()
})

test('responsive first fold does not introduce horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-cm-welcome]')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})
