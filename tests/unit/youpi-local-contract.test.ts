import { describe, expect, it, vi } from 'vitest'
import { createLocalFixtureCheckout, observeLocalFixtureStatus, type TestInvoice } from '../../src/payments/youpi-local-contract'

const paymentId = '12345678-1234-4123-8123-123456789abc'
const merchantId = '98765432-1234-4123-8123-123456789abc'
const invoice: TestInvoice = {
  source: 'LOCAL_FIXTURE_ONLY', invoiceId: 'FAKE-12345678-1234-4123-8123-123456789abc',
  orderId: 'CNP-INVOICE-EXAMPLE-0001', merchantId, amountPaise: 12345, currency: 'INR',
}
const response = {
  orderId: invoice.orderId, amount: '123.45', currency: 'INR',
  paymentId, checkoutUrl: 'http://127.0.0.1:7000/checkout/' + paymentId, status: 'ACTIVE',
}

describe('YouPI fixture-only contract', () => {
  it('binds the merchant, maps paise to INR, preserves PENDING bank status', async () => {
    const transport = vi.fn().mockResolvedValue(response)
    const result = await createLocalFixtureCheckout(invoice, transport)
    expect(transport).toHaveBeenCalledWith({
      method: 'POST', url: 'http://127.0.0.1:6100/api/v1/payments',
      headers: {
        'Content-Type': 'application/json', 'X-Merchant-Id': merchantId,
        'Idempotency-Key': 'cns-' + invoice.orderId,
      },
      body: JSON.stringify({orderId: invoice.orderId, amount: '123.45', currency: 'INR', description: 'CredoNomics local fixture only'}),
    })
    expect(result).toMatchObject({ paymentId, invoiceStatus: 'PENDING', independentBankVerified: false, canSettleInvoice: false })
  })

  it('rejects live invoice input before calling transport', async () => {
    const transport = vi.fn()
    await expect(createLocalFixtureCheckout({ ...invoice, source: 'LIVE' as never }, transport)).rejects.toThrow('ONLY_VALID_LOCAL_FIXTURE')
    expect(transport).not.toHaveBeenCalled()
  })

  it('rejects inaccurate amounts and invalid merchant ids', async () => {
    await expect(createLocalFixtureCheckout(invoice, async () => ({...response, amount:'12.34'}))).rejects.toThrow('GATEWAY_CONTRACT_MISMATCH')
    await expect(createLocalFixtureCheckout({...invoice, amountPaise: 0}, async () => response)).rejects.toThrow('ONLY_VALID_LOCAL_FIXTURE')
    await expect(createLocalFixtureCheckout({...invoice, merchantId:'unknown'}, async () => response)).rejects.toThrow('ONLY_VALID_LOCAL_FIXTURE')
  })

  it('rejects already-successful create sessions', async () => {
    await expect(createLocalFixtureCheckout(invoice, async () => ({...response, status:'SUCCESS'}))).rejects.toThrow('GATEWAY_CONTRACT_MISMATCH')
  })

  it('blocks unexpected checkout origins, URL params, credentials and wrong session ids', async () => {
    for (const checkoutUrl of [
      'https://pay.example.org/checkout/' + paymentId,
      'http://127.0.0.1:7000.evil.test/checkout/' + paymentId,
      'http://127.0.0.1:7000/checkout/' + paymentId + '?next=https://evil.test',
      'http://foo@127.0.0.1:7000/checkout/' + paymentId,
      'http://127.0.0.1:7000/checkout/wrong',
    ]) {
      await expect(createLocalFixtureCheckout(invoice, async () => ({...response, checkoutUrl}))).rejects.toThrow()
    }
  })

  it('never treats an upstream SUCCESS as a bank-confirmed PAID invoice', async () => {
    const result = await observeLocalFixtureStatus(paymentId, async () => ({paymentId, status:'SUCCESS'}))
    expect(result).toEqual({
      gatewayStatus:'SUCCESS', reconciliationState:'REVIEW_REQUIRED', invoiceStatus:'PENDING',
      independentBankVerified:false, canSettleInvoice:false,
    })
  })

  it('rejects mismatched payment status session ids', async () => {
    await expect(observeLocalFixtureStatus(paymentId, async () => ({paymentId:'wrong',status:'SUCCESS'}))).rejects.toThrow('GATEWAY_STATUS_CONTRACT_MISMATCH')
  })
})
