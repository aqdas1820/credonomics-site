#!/usr/bin/env node
/** Read-only public DNS observation. Never calls a hosting/DNS mutation API. */
import { Resolver } from 'node:dns/promises'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export const digest = value => createHash('sha256').update(value).digest('hex')
const canonical = value => value.toLowerCase().replace(/\.$/, '')
const equalSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())

export function assess(record, values) {
  if (record.type === 'TXT') {
    const selected = values.filter(v => !record.prefix || v.toLowerCase().startsWith(record.prefix.toLowerCase()))
    if (!selected.length) return { status: 'FAIL', detail: 'Required TXT class absent' }
    if (['spf', 'dmarc'].includes(record.id) && selected.length !== 1) return { status: 'FAIL', detail: 'Multiple policy records' }
    if (record.id === 'spf' && (!selected[0].includes('include:spf.improvmx.com') || !/\s[~-]all\s*$/i.test(selected[0])))
      return { status: 'FAIL', detail: 'SPF lacks expected include or restrictive terminal all' }
    if (record.id === 'dmarc' && !/;\s*p=(none|quarantine|reject)(;|$)/i.test(selected[0]))
      return { status: 'FAIL', detail: 'DMARC policy missing or invalid' }
    if (!record.sha256?.length) return { status: 'WARN', detail: 'Present; expected TXT fingerprints not supplied' }
    return { status: equalSet(selected.map(digest), record.sha256) ? 'PASS' : 'FAIL', detail: 'TXT fingerprint comparison; values redacted' }
  }
  if (!values.length) return { status: 'FAIL', detail: 'No public answer' }
  if (!record.expected?.length) return { status: 'WARN', detail: 'Resolves; exact owner-approved target not supplied' }
  return { status: equalSet(values.map(canonical), record.expected.map(canonical)) ? 'PASS' : 'FAIL', detail: 'Exact target set comparison' }
}

export async function inspect(config, resolver) {
  if (config.domain !== 'credonomics.in' || !Array.isArray(config.records)) throw Error('Invalid manifest')
  const results = []
  for (const record of config.records) {
    if (!/^[a-z0-9_-]+$/i.test(record.id) || !['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'].includes(record.type) ||
      !(record.name === config.domain || record.name.endsWith('.' + config.domain))) throw Error('Invalid record definition')
    try {
      const raw = await resolver.resolve(record.name, record.type)
      const values = record.type === 'TXT' ? raw.map(parts => parts.join('')) :
        record.type === 'MX' ? raw.map(v => `${v.priority} ${canonical(v.exchange)}`) : raw
      results.push({ id: record.id, name: record.name, type: record.type, ...assess(record, values),
        // Only fingerprints persist, even for verification TXT records or resolver errors.
        observedSha256: values.map(v => digest(record.type === 'TXT' ? v : canonical(v))).sort() })
    } catch (error) {
      const missing = ['ENODATA', 'ENOTFOUND'].includes(error?.code)
      results.push({ id: record.id, name: record.name, type: record.type,
        status: missing ? 'FAIL' : 'WARN', detail: missing ? 'Required DNS answer absent' : 'DNS query unavailable; retry later', observedSha256: [] })
    }
  }
  return { schemaVersion: 1, observedAt: new Date().toISOString(), domain: config.domain,
    scope: 'PUBLIC_DNS_ONLY_NOT_PENDING_ZONE', declaredPendingCustomRecords: 12, results }
}

export function compare(before, after) {
  if (before.schemaVersion !== 1 || before.domain !== after.domain || !Array.isArray(before.results)) throw Error('Invalid baseline')
  return after.results.map(row => {
    const old = before.results.find(v => v.id === row.id && v.name === row.name && v.type === row.type)
    return { id: row.id, status: old && equalSet(old.observedSha256, row.observedSha256) ? 'PASS' : 'WARN',
      detail: old && equalSet(old.observedSha256, row.observedSha256) ? 'Public answer fingerprints unchanged' : 'Public answers changed or baseline missing; review expected configuration' }
  })
}

async function main() {
  const args = process.argv.slice(2)
  const allowed = ['--config', '--output', '--before', '--server']
  if (args.length % 2 || args.some((v, i) => i % 2 === 0 && !allowed.includes(v))) throw Error('Use --config FILE --output FILE --before FILE --server IP (all optional)')
  const options = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, i) => [args[i*2], args[i*2+1]]))
  const config = JSON.parse(await readFile(options['--config'] || new URL('./expected.pending.redacted.json', import.meta.url), 'utf8'))
  const resolver = new Resolver({ timeout: 4000, tries: 2 })
  if (options['--server']) resolver.setServers([options['--server']])
  const result = await inspect(config, resolver)
  if (options['--before']) result.comparison = compare(JSON.parse(await readFile(options['--before'], 'utf8')), result)
  console.log('PUBLIC DNS ONLY. Does not verify the pending Cloudflare zone or its 12 custom records.')
  for (const row of result.results) console.log(`${row.status} ${row.id}: ${row.detail}`)
  for (const row of result.comparison || []) console.log(`${row.status} before/after ${row.id}: ${row.detail}`)
  if (options['--output']) await writeFile(options['--output'], JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  process.exitCode = result.results.some(v => v.status === 'FAIL') ? 1 :
    result.results.some(v => v.status === 'WARN') || result.comparison?.some(v => v.status === 'WARN') ? 2 : 0
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('FAIL: DNS verifier could not complete; check arguments/configuration locally. No record values logged.'); process.exitCode = 1 })
}
