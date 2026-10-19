import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'
// Synthetic authorized SSR fixtures only; no hosted login/customer record used.
for (const width of [320, 375, 768]) {
  test(`private synthetic document controls fit ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const html = await readFile(join(process.cwd(), 'artifacts/billing-documents/archive-controls.html'), 'utf8')
    await page.setContent(html)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
    await expect(page.getByRole('button', { name: 'Download archived PDF' })).toBeVisible()
  })
}
test('long synthetic invoice prints to A4 without controls and retains amount/quantity', async ({ page }) => {
  await page.setContent(await readFile(join(process.cwd(), 'artifacts/billing-documents/boundary.html'), 'utf8'))
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('navigation')).toBeHidden()
  await expect(page.getByText('2147483647', { exact: true })).toBeVisible()
  const pdf = await PDFDocument.load(await page.pdf({ preferCSSPageSize: true }))
  const { width, height } = pdf.getPage(0).getSize()
  expect(Math.abs(width - 595.28)).toBeLessThan(1); expect(Math.abs(height - 841.89)).toBeLessThan(1)
})
