import { expect, test } from '@playwright/test'

test('premium contribution popup selects amounts but never claims payment', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Support CredoNomics' }).click()
  const dialog = page.getByRole('dialog', { name: /A little support/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Online contributions are not active yet.')).toBeVisible()
  await dialog.getByRole('button', { name: /₹500/ }).click()
  await expect(dialog.getByRole('link', { name: /Request instructions for ₹500/ })).toHaveAttribute('href', /mailto:hello@credonomics.in/)
  await dialog.getByRole('button', { name: 'Maybe later' }).click()
  await expect(dialog).not.toBeVisible()
})

test('reduced motion keeps support functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Support CredoNomics' }).click()
  const dialog = page.getByRole('dialog', { name: /A little support/ })
  await dialog.getByRole('button', { name: /₹10/ }).click()
  await expect(dialog.getByRole('link', { name: /Request instructions for ₹10/ })).toBeVisible()
})
