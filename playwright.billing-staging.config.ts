import { defineConfig } from '@playwright/test'

// Explicit opt-in; no web server, trace, screenshot, video or HTML attachments.
const baseURL = process.env.BILLING_STAGING_E2E_ORIGIN
if (baseURL) {
  const u = new URL(baseURL)
  if (u.protocol !== 'https:' || u.username || u.password || u.pathname !== '/' || u.search || u.hash ||
      !u.hostname.endsWith('.vercel.app')) throw new Error('Dedicated HTTPS staging preview origin required')
}
export default defineConfig({
  testDir: './tests/staging', workers: 1, retries: 0, timeout: 30000, reporter: 'line',
  outputDir: 'test-results/staging-private',
  use: { baseURL, trace: 'off', screenshot: 'off', video: 'off', ignoreHTTPSErrors: false },
})
