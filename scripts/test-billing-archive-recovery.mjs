import { spawnSync } from 'node:child_process'
// No user paths, DB connections, credentials or cloud operations accepted.
if (process.argv.length !== 2) throw new Error('Synthetic recovery drill accepts no arguments')
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'src/lib/billing/document-recovery.test.ts'], { stdio: 'inherit' })
process.exitCode = result.status ?? 1
