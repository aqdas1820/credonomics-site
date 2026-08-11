const targets = [
  ['homepage', 'https://www.credonomics.in/', 'CredoNomics'],
  ['cards', 'https://www.credonomics.in/cards', 'actual spending'],
  ['all cards', 'https://www.credonomics.in/cards/all', 'normalized'],
  ['cashback', 'https://www.credonomics.in/cards/cashback', 'Cashback Credit Cards'],
  ['fuel', 'https://www.credonomics.in/cards/fuel', 'Fuel Credit Cards'],
  ['coverage', 'https://www.credonomics.in/cards/coverage', 'actually verified'],
  ['ipo intelligence', 'https://www.credonomics.in/ipo', 'IPO Intelligence'],
  ['ipo analyzer', 'https://www.credonomics.in/ipo/analyzer', 'IPO Data Score'],
  ['official identity', 'https://www.credonomics.in/official', 'www.credonomics.in'],
  ['robots', 'https://www.credonomics.in/robots.txt', 'sitemap.xml'],
  ['sitemap', 'https://www.credonomics.in/sitemap.xml', '/cards/cashback'],
]

let failed = false

for (const [name, url, marker] of targets) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'CredoNomicsSiteHealth/2.0' },
    })
    const text = await response.text()
    const markerOk = text.toLowerCase().includes(marker.toLowerCase())
    console.log(`${response.ok && markerOk ? 'OK  ' : 'WARN'} ${name}: HTTP ${response.status} · marker ${markerOk ? 'found' : 'missing'}`)
    if (!response.ok || !markerOk) failed = true
  } catch (error) {
    console.error(`FAIL ${name}: ${error?.message || error}`)
    failed = true
  }
}

// Canonical apex host should end on www.
try {
  const response = await fetch('https://credonomics.in/', {
    redirect: 'follow',
    headers: { 'user-agent': 'CredoNomicsSiteHealth/2.0' },
  })
  const finalHost = new URL(response.url).hostname
  const ok = finalHost === 'www.credonomics.in'
  console.log(`${ok ? 'OK  ' : 'WARN'} canonical host: ${finalHost}`)
  if (!ok) failed = true
} catch (error) {
  console.error(`FAIL canonical host: ${error?.message || error}`)
  failed = true
}

if (failed) {
  console.error('One or more production checks failed. Review deployment/domain/crawl state.')
  process.exit(1)
}
