import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/data/mf-intelligence/v2')
const sourceManifest = path.resolve('data/mf-production-source/manifest.json')

function endOfMonth(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month ?? '')
  if (!match) return null
  return new Date(Date.UTC(Number(match[1]), Number(match[2]), 0, 23, 59, 59)).toISOString()
}

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? jsonFiles(target) : target.endsWith('.json') ? [target] : []
  }))
  return nested.flat()
}

async function generatedAt() {
  try {
    const manifest = JSON.parse(await readFile(sourceManifest, 'utf8'))
    if (manifest.generatedAtUtc) return new Date(manifest.generatedAtUtc).toISOString()
  } catch {}
  return (await stat(path.join(root, 'index.json'))).mtime.toISOString()
}

const generated = await generatedAt()
for (const file of await jsonFiles(root)) {
  if (file.endsWith(`${path.sep}manifest.json`)) continue
  const payload = JSON.parse(await readFile(file, 'utf8'))
  const month = payload.month ?? payload.latestMonth ?? payload.latestTracked ?? payload.months?.at?.(-1)
  payload.metadata = {
    source: 'HDFC Mutual Fund portfolio disclosures',
    asOf: endOfMonth(month),
    generatedAt: generated,
    quality: 'low',
    availability: 'stale',
  }
  await writeFile(file, `${JSON.stringify(payload)}\n`, 'utf8')
}

process.stdout.write(`Enriched ${root} with source, asOf, generatedAt, quality and availability metadata.\n`)
