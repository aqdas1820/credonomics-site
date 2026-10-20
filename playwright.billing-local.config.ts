import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/billing-local', workers: 1, retries: 0, reporter: 'line',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3017', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: { command: 'node scripts/start-billing-disabled-check.mjs', url: 'http://127.0.0.1:3017', reuseExistingServer: false, timeout: 60000 },
})
