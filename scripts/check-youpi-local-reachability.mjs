/**
 * Read-only, local-only connectivity check for a user-operated YouPI-PG installation.
 * Usage: node scripts/check-youpi-local-reachability.mjs
 * No payments, OTPs, sessions, webhooks or settlement operations.
 */
import net from 'node:net'

const services = [
  ['YouPI Payment API', 6100],
  ['YouPI Checkout Portal', 7000],
  ['YouPI Merchant Dashboard', 6001],
]

function probeTcp(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port })
    let finished = false
    const complete = (ok, detail) => {
      if (finished) return
      finished = true
      socket.destroy()
      resolve({ ok, detail })
    }
    socket.setTimeout(3500)
    socket.on('connect', () => complete(true, 'TCP connection established'))
    socket.on('timeout', () => complete(false, 'Timed out'))
    socket.on('error', (error) => complete(false, error.code || 'Connection failed'))
  })
}

console.log('CredoNomics x YouPI — LOCAL READ-ONLY REACHABILITY CHECK')
console.log('Target host: 127.0.0.1 (your own computer)')
console.log('No financial, OTP or customer operations will be performed.\n')

let unavailable = 0
for (const [name, port] of services) {
  const result = await probeTcp(port)
  if (!result.ok) unavailable += 1
  console.log((result.ok ? 'REACHABLE' : 'UNREACHABLE') + ' | ' + name + ' | 127.0.0.1:' + port + ' | ' + result.detail)
}

console.log('\nInterpretation:')
console.log('- REACHABLE means local TCP accepts connections; this is NOT proof that the service is healthy.')
console.log('- Payment API contracts, OTP, webhook and bank verification are NOT tested.')
console.log('- The public Vercel deployment cannot reach this PC via 127.0.0.1.')
console.log('- Do not publicly expose the gateway or enable payments based on this check.')
process.exitCode = unavailable ? 1 : 0
