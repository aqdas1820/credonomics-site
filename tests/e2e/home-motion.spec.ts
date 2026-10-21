import { expect, test } from '@playwright/test'

test('premium homepage keeps navigation, trust messaging, and no overflow', async ({ page })=>{
  await page.goto('/')
  await expect(page.locator('[data-cm-hero]')).toBeVisible()
  await expect(page.getByRole('heading',{name:/Financial intelligence,/})).toBeVisible()
  await expect(page.getByRole('link',{name:/Explore research/}).first()).toHaveAttribute('href','/research')
  await expect(page.getByRole('link',{name:/Open financial tools/})).toHaveAttribute('href','/tools')
  await expect(page.getByText('Live index feed unavailable')).toBeVisible()
  await expect(page.getByText('Intelligence data pending')).toBeVisible()
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('reduced-motion preference does not hide homepage content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  await expect(page.locator('[data-cm-hero]')).toBeVisible()
  await expect(page.locator('[data-cm-reveal]').first()).toBeVisible()
})
