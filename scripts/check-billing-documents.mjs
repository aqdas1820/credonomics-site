// Checks HTML rendered by the real server component with synthetic RPC mocks.
// No server, customer auth bypass, or live financial integrations are used.
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { join } from 'node:path'

const directory = join(process.cwd(), 'artifacts/billing-documents')
await mkdir(directory, { recursive: true })
const browser = await chromium.launch({ headless: true })
let checks = 0
try {
  for (const state of ['unpaid', 'partial', 'paid', 'boundary', 'receipt']) {
    const html = await readFile(join(directory, state + '.html'), 'utf8')
    const page = await browser.newPage()
    // Fixtures load no external resources, including any URLs in global CSS.
    await page.route('**/*', route => route.abort())
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.setContent(html)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
        `${state} overflows at ${width}px`)
      checks++
    }
    await page.setViewportSize({ width: 794, height: 1123 })
    await page.emulateMedia({ media: 'print' })
    assert.equal(await page.locator('nav').isVisible(), false, `${state} prints admin controls`)
    assert.equal(await page.locator('article').isVisible(), true)
    await page.pdf({ path: join(directory, state + '-SYNTHETIC.pdf'), format: 'A4', preferCSSPageSize: true })
    await page.screenshot({ path: join(directory, state + '-print.png'), fullPage: true })
    checks++
    await page.close()
  }
  console.log(`PASS: ${checks} synthetic document layout/print checks; not authenticated database E2E`)
} finally {
  await browser.close()
}
