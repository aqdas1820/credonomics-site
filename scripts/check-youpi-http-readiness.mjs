/**
 * CredoNomics YouPI HTTP readiness diagnostic (read-only).
 * Only GET calls to loopback services on the operator's own PC.
 * No OTP, payment, transaction or admin mutation calls.
 * Never prints credentials, customers, session IDs or raw responses.
 */
const checks = [
  { name: 'Payment API /health', url: 'http://127.0.0.1:6100/health', kind: 'health' },
  { name: 'Payment API /api/v1/health', url: 'http://127.0.0.1:6100/api/v1/health', kind: 'health' },
  { name: 'Checkout Portal /health', url: 'http://127.0.0.1:7000/health', kind: 'health' },
  { name: 'Checkout UPI indicator', url: 'http://127.0.0.1:6100/api/v1/checkout/server-health', kind: 'indicator' },
]

console.log('CredoNomics × YouPI HTTP readiness | read-only local GET checks')
for (const { name, url, kind } of checks) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(3500), headers: { Accept: 'application/json' } })
    let json = {}
    try { json = await res.json() } catch {}
    const fields = kind === 'indicator'
      ? { status: json.status ?? null, tier: json.tier ?? null, isWorking: json.isWorking ?? null, smsHealthy: json.smsHealthy ?? null, gmailHealthy: json.gmailHealthy ?? null, reason: String(json.reason ?? '').slice(0, 160) }
      : { status: json.status ?? null, service: json.service ?? null }
    console.log(name + ' | HTTP ' + res.status + ' | ' + JSON.stringify(fields))
  } catch (error) {
    console.log(name + ' | ERROR ' + (error.cause?.code || error.name || 'unavailable'))
  }
}
console.log('Note: healthy HTTP responses do not establish real payment settlement, bank credit, or public gateway security.')
