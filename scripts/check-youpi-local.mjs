/** Read-only connection probe. No transaction or account data is accessed. */
import net from 'node:net'

async function checkApi() {
  try {
    const r = await fetch('http://127.0.0.1:6100/api/v1/health', { signal: AbortSignal.timeout(5000), cache: 'no-store' })
    if (!r.ok) return false
    const body = await r.json()
    return body?.status === 'UP' && body?.service === 'payment-api'
  } catch { return false }
}
function checkCheckoutPort() {
  return new Promise(resolve => {
    const conn = net.createConnection({ host: '127.0.0.1', port: 7000 })
    const timer = setTimeout(() => { conn.destroy(); resolve(false) }, 4000)
    conn.once('connect', () => { clearTimeout(timer); conn.destroy(); resolve(true) })
    conn.once('error', () => { clearTimeout(timer); conn.destroy(); resolve(false) })
  })
}
const api = await checkApi()
const checkout = await checkCheckoutPort()
console.log('YouPI payment API: ' + (api ? 'PASS' : 'NOT REACHABLE'))
console.log('YouPI checkout port 7000: ' + (checkout ? 'PASS' : 'NOT REACHABLE'))
console.log('READ-ONLY: no payment initiated or settled')
process.exitCode = api && checkout ? 0 : 1
