import { expect, test } from '@playwright/test'

test('cursor halo follows actual mouse coordinates and remains click-through', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop pointer experience')
  await page.goto('/')
  const aura = page.locator('[data-cm-cursor-aura]')
  const halo = page.locator('[data-cm-cursor-halo]')

  await expect(aura).toHaveAttribute('aria-hidden', 'true')
  await expect(aura).toHaveCSS('pointer-events', 'none')

  await page.mouse.move(150, 180)
  await expect(halo).toHaveAttribute('data-active', 'true')
  await expect(halo).toHaveCSS('opacity', '1')
  const positionA = await halo.evaluate((el) => (el as HTMLElement).style.transform)
  expect(positionA).toContain('translate3d(')

  await page.mouse.move(770, 490)
  await expect.poll(() => halo.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe(positionA)

  // The decorative layer must not block links or buttons.
  await page.getByRole('button', { name: 'Support CredoNomics' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('mouse glow supports desktop with touch capabilities', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 800 }, hasTouch: true })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await page.mouse.move(390, 300)
    await expect(page.locator('[data-cm-cursor-halo]')).toHaveAttribute('data-active', 'true')
  } finally {
    await context.close()
  }
})

test('reduced motion hides cursor effect', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('[data-cm-cursor-aura]')).toHaveCSS('display', 'none')
})

test('touch-only viewport hides cursor effect', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile viewport')
  await page.goto('/')
  await expect(page.locator('[data-cm-cursor-aura]')).toHaveCSS('display', 'none')
})
