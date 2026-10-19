/**
 * Local-only observer service diagnostics, non-transactional.
 * GET /health only; does not trigger /api/browser/status auto-pairing.
 * Does not read SMS, Gmail, WhatsApp messages or customer information.
 */
const services = [
  { name: 'Google Messages / SMS observer', port: 6002 },
  { name: 'Gmail observer', port: 6003 },
]
console.log('CredoNomics x YouPI — observer processes (READ-ONLY)')
for (const { name, port } of services) {
  try {
    const response = await fetch('http://127.0.0.1:' + port + '/health', {
      method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(3000),
      headers: { Accept: 'application/json' },
    })
    let data = {}
    try { data = await response.json() } catch {}
    console.log(JSON.stringify({
      service: name,
      port, httpStatus: response.status,
      processStatus: typeof data.status === 'string' ? data.status : 'unknown',
      isRunning: typeof data.isRunning === 'boolean' ? data.isRunning : null,
    }))
  } catch (error) {
    console.log(JSON.stringify({ service: name, port, result: 'UNREACHABLE', reason: error?.cause?.code || error?.name || 'network-error' }))
  }
}
console.log('Observer process UP does not imply paired, logged in, polling, bank verified or payment READY.')
console.log('Next: inspect Merchant Dashboard > Payment Observers Status without sharing message contents or credentials.')
