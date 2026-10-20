import { spawn } from 'node:child_process'
const env = { ...process.env }
env.PERSONAL_TESTING_ENABLED = 'false'
for (const key of ['BILLING_API_ENABLED', 'BILLING_PORTAL_ENABLED', 'BILLING_WRITE_ENABLED', 'BILLING_SETTLEMENT_ENABLED',
  'BILLING_SYSTEM_ENABLED', 'BILLING_YOUPI_OBSERVATION_ENABLED', 'BILLING_PDF_ARCHIVE_ENABLED']) env[key] = 'false'
// No credential is needed for the disabled-route browser checks.
for (const key of ['SUPABASE_SERVICE_ROLE_KEY', 'BILLING_PDF_ARCHIVE_INTEGRITY_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']) delete env[key]
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3017'], { env, stdio: 'inherit' })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('exit', code => { process.exitCode = code ?? 1 })
