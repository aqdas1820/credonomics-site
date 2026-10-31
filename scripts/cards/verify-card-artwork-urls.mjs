// Non-blocking reachability audit for editorial credit-card photos.
// SSR/TypeScript checks cannot prove a third-party image URL remains alive.
// This script does not store/download images and cannot grant reuse permission.
import { readFileSync } from 'node:fs'

const source = readFileSync('app/data/card-artwork.ts', 'utf8')
const urls = [...new Set([...source.matchAll(/url:\s*'(https:\/\/[^']+)'/g)].map(match => match[1]))]
const results = []

async function inspect(url) {
  try {
    const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-127', Accept: 'image/*' }, signal: AbortSignal.timeout(7000), redirect: 'follow' })
    const contentType = res.headers.get('content-type') || ''
    await res.body?.cancel()
    const ok = res.ok && contentType.toLowerCase().startsWith('image/')
    return { host: new URL(url).hostname, status: res.status, type: contentType, ok }
  } catch (error) {
    return { host: new URL(url).hostname, status: 0, ok: false, error: error instanceof Error ? error.name : 'Network error' }
  }
}
for (let i = 0; i < urls.length; i += 4) results.push(...await Promise.all(urls.slice(i, i + 4).map(inspect)))
for (const r of results) console.log([r.ok ? 'OK' : 'REVIEW', r.host, r.status, r.type || r.error || ''].join(' | '))
console.log('Reachable image links:', results.filter(r => r.ok).length, '/', results.length)

// Candidate replacements: audit only, not published until both status and content-type pass.
const candidates = [
  'https://www.rewardmatrix.in/cards/hdfc-millennia.png',
  'https://www.rewardmatrix.in/cards/tata-neu-infinity-hdfc.png',
  'https://www.rewardmatrix.in/cards/indianoil-hdfc.png',
]
for (const candidate of candidates) {
  const result = await inspect(candidate)
  console.log('CANDIDATE | ' + new URL(candidate).pathname + ' | ' + (result.ok ? 'OK' : 'REVIEW') + ' | ' + result.status + ' | ' + (result.type || result.error || ''))
}
