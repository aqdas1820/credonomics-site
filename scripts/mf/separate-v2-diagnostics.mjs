import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

const publicRoot = path.resolve('public/data/mf-intelligence/v2')
const diagnosticsRoot = path.resolve('data/mf-production-diagnostics/v2')
await mkdir(diagnosticsRoot, { recursive: true })

for (const relative of ['by-scheme', 'latest_holdings.csv', 'quality_audit.csv', 'manifest.json']) {
  const source = path.join(publicRoot, relative)
  const destination = path.join(diagnosticsRoot, relative)
  try {
    await rm(destination, { recursive: true, force: true })
    await rename(source, destination)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
process.stdout.write('Separated MF diagnostics from the browser runtime projection.\n')
