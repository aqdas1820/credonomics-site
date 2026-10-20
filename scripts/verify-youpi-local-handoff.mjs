/**
 * Run only on the owner's PC with the local YouPI checkout already running.
 * This calls the REAL CredoNomics gateway adapter rather than duplicating its HTTP request.
 * Creates one new 1 INR INITIATED local gateway record. Does NOT transfer money.
 * Node.js >= 22.18 with native TypeScript erasure required (owner is on Node 26).
 */
import { randomUUID } from 'node:crypto'
import { createYoupiSession, probeYoupi } from '../src/lib/billing/youpi-contract.ts'

const marker = '--create-local-test-session'
const fail = (message) => { console.error('YOUPI ADAPTER HANDOFF - FAIL: ' + message); process.exitCode = 1 }
if (process.argv.slice(2).length !== 1 || process.argv[2] !== marker) {
  console.error('Usage: node scripts/verify-youpi-local-handoff.mjs ' + marker)
  console.error('Creates one unpaid INR 1.00 TEST session locally. Never scan or pay the QR.')
  process.exitCode = 2
} else if (Number(process.versions.node.split('.')[0]) < 23 || process.env.NODE_ENV === 'production' || process.env.CI || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT_ID) {
  fail('Only local Node.js 23+ development sessions are allowed.')
} else {
  const config = Object.freeze({
    apiOrigin: 'http://127.0.0.1:6100',
    checkoutOrigin: 'http://localhost:7000',
    merchantId: '00000000-0000-0000-0000-000000000001',
    allowLocal: true,
  })
  try {
    if (!await probeYoupi(config)) throw new Error('local YouPI payment-api is not reachable')
    const id = randomUUID()
    const invoice = {
      id,
      invoiceNumber: 'LOCAL-TEST-' + id.slice(0, 8),
      totalPaise: 100,
      paidPaise: 0,
      status: 'UNPAID',
    }
    // Calls src/lib/billing/youpi-contract.ts (same library as the live server-side route).
    const session = await createYoupiSession(config, invoice)
    if (session.status !== 'INITIATED' || session.amountPaise !== 100 ||
        session.orderId !== 'CN-' + id || !session.paymentId) {
      throw new Error('gateway session mismatched order, amount or initial status')
    }
    const statusUrl = 'http://127.0.0.1:6100/api/v1/payments/' + encodeURIComponent(session.paymentId)
    const res = await fetch(statusUrl, {
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('payment status GET failed')
    const state = await res.json()
    if (state.status !== 'INITIATED' || state.paymentId !== session.paymentId ||
        state.orderId !== session.orderId || state.currency !== 'INR' ||
        String(state.amountPaise) !== '100') {
      throw new Error('payment status does not match created unpaid session')
    }
    console.log('CREDONOMICS -> YOUPI REAL ADAPTER HANDOFF - PASS')
    console.log('INR 1.00 | Status: INITIATED | No payment or bank credit made')
    console.log('Local checkout: ' + session.checkoutUrl)
    console.log('DO NOT SCAN OR PAY THE QR. NOT PUBLICLY ACCESSIBLE.')
  } catch (err) {
    fail(err instanceof Error ? err.message : 'Unexpected failure')
  }
}
