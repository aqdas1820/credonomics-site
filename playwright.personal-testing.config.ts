import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/personal-testing',workers:1,retries:0,reporter:'line',timeout:60_000,
  use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:3019',trace:'off',screenshot:'off',video:'off'},
  webServer:{command:'node scripts/start-personal-testing.mjs --fixture',url:'http://127.0.0.1:3019/personal-testing',reuseExistingServer:false,timeout:240_000,
    env:{PERSONAL_TESTING_FIXTURE_RUN:'1'}},
})
