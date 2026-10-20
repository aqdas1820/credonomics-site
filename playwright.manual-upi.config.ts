import {defineConfig,devices} from '@playwright/test'
export default defineConfig({testDir:'./tests/manual-upi',workers:1,retries:0,reporter:'line',
  use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:3107',trace:'off',video:'off',screenshot:'off'},
  webServer:{command:'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3107',url:'http://127.0.0.1:3107',timeout:60000,reuseExistingServer:false,
    env:{NEXT_TELEMETRY_DISABLED:'1',BILLING_API_ENABLED:'false',BILLING_PORTAL_ENABLED:'false',MANUAL_UPI_ENABLED:'false',MANUAL_UPI_PILOT_APPROVED:'false'}}})
