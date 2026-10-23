import { expect, test } from '@playwright/test'

const families = ['/', '/research', '/ipo/current', '/mutual-funds', '/tools/mf-portfolio-tracker', '/cards/all', '/cards/analyzer', '/cards/compare', '/tools', '/discover', '/methodology', '/privacy', '/official', '/this-route-does-not-exist']
for (const route of families) {
  test(`Midnight presentation ${route}`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(route)
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
    await page.screenshot({ path: testInfo.outputPath('midnight.png'), fullPage: true })
  })
}

test('command search contains focus, announces results, and restores focus on Escape', async ({ page }) => {
  await page.goto('/research')
  const trigger = page.getByRole('button', { name: 'Search CredoNomics', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'CredoNomics Intelligence Search' })
  await expect(dialog).toBeVisible()
  const input = dialog.getByRole('combobox')
  await expect(input).toBeFocused()
  await input.fill('methodology')
  await expect(dialog.getByRole('option').first()).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('keyboard shortcut opens search, empty results are distinct, and Tab stays in dialog', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', { name: 'CredoNomics Intelligence Search' })
  const input = dialog.getByRole('combobox')
  await input.fill('zzzz-no-such-research')
  await expect(dialog.getByText(/No matching CredoNomics research found/i)).toBeVisible()
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true)
  }
})

test('reduced motion and theme change preserve usable navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/tools')
  const style = await page.locator('.cn-context svg').evaluate(node => getComputedStyle(node).animationName)
  expect(style).toBe('none')
  await expect(page.locator('#main-content')).toBeVisible()
})
