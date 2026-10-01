import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ contact: vi.fn(), checkout: vi.fn(), auth: vi.fn(), limit: vi.fn() }))
vi.mock('resend', () => ({ Resend: class { contacts = { create: mocks.contact } } }))
vi.mock('stripe', () => ({ default: class { checkout = { sessions: { create: mocks.checkout } } } }))
vi.mock('../../src/lib/supabase/server', () => ({ authenticatedUser: mocks.auth }))
vi.mock('../../src/services/server/rate-limit', () => ({ rateLimit: mocks.limit }))
import { POST as newsletter } from '../../app/api/newsletter/route'
import { POST as checkout } from '../../app/api/checkout/route'

function request(path: string, data?: unknown) {
  return new Request(`https://preview.example${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.limit.mockReturnValue(true)
  mocks.auth.mockResolvedValue({ client: {}, user: { id: 'test-user', email: 'qa@example.com' } })
  vi.stubEnv('RESEND_API_KEY', 'test-placeholder')
  vi.stubEnv('RESEND_NEWSLETTER_SEGMENT_ID', 'test-segment')
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_placeholder')
  vi.stubEnv('STRIPE_PRICE_ID', 'price_test')
  vi.stubEnv('STRIPE_CHECKOUT_ENABLED', 'true')
})
afterEach(() => vi.unstubAllEnvs())

describe('newsletter provider confirmation (mocked provider)', () => {
  it.each(['', 'invalid'])('rejects invalid email %s without contacting Resend', async email => {
    expect((await newsletter(request('/api/newsletter', { email }))).status).toBe(400)
    expect(mocks.contact).not.toHaveBeenCalled()
  })
  it('fails safely when configuration is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    expect((await newsletter(request('/api/newsletter', { email: 'qa@example.com' }))).status).toBe(503)
    expect(mocks.contact).not.toHaveBeenCalled()
  })
  it('never reports success on provider failure', async () => {
    mocks.contact.mockResolvedValue({ data: null, error: { message: 'Provider failure' } })
    const response = await newsletter(request('/api/newsletter', { email: 'qa@example.com' }))
    expect(response.status).toBe(503)
    expect((await response.json()).success).toBeUndefined()
  })
  it('waits for confirmation before reporting success', async () => {
    mocks.contact.mockResolvedValue({ data: { id: 'contact-test' }, error: null })
    const response = await newsletter(request('/api/newsletter', { email: 'qa@example.com' }))
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
    expect(mocks.contact).toHaveBeenCalledWith({ email: 'qa@example.com', segments: [{ id: 'test-segment' }] })
  })
  it('does not contact the provider after duplicate rate limiting', async () => {
    mocks.limit.mockReturnValueOnce(true).mockReturnValueOnce(false)
    expect((await newsletter(request('/api/newsletter', { email: 'qa@example.com' }))).status).toBe(429)
    expect(mocks.contact).not.toHaveBeenCalled()
  })
})

describe('checkout provider confirmation (mocked TEST provider)', () => {
  it('does not start checkout when disabled', async () => {
    vi.stubEnv('STRIPE_CHECKOUT_ENABLED', 'false')
    expect((await checkout(request('/api/checkout'))).status).toBe(503)
    expect(mocks.checkout).not.toHaveBeenCalled()
  })
  it('requires a signed-in user', async () => {
    mocks.auth.mockResolvedValue({ client: {}, user: null })
    expect((await checkout(request('/api/checkout'))).status).toBe(401)
    expect(mocks.checkout).not.toHaveBeenCalled()
  })
  it('fails safely on provider rejection', async () => {
    mocks.checkout.mockRejectedValue(new Error('Provider failure'))
    const response = await checkout(request('/api/checkout'))
    expect(response.status).toBe(503)
    expect((await response.json()).url).toBeUndefined()
  })
  it('requires a provider checkout URL and sets a same-origin cancellation route', async () => {
    mocks.checkout.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/test-session' })
    const response = await checkout(request('/api/checkout'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/test-session' })
    expect(mocks.checkout).toHaveBeenCalledWith(expect.objectContaining({ cancel_url: 'https://preview.example/pricing?canceled=true', client_reference_id: 'test-user' }))
  })
  it('fails safely when the provider returns no checkout URL', async () => {
    mocks.checkout.mockResolvedValue({ url: null })
    expect((await checkout(request('/api/checkout'))).status).toBe(503)
  })
  it('does not create another session after rate limiting', async () => {
    mocks.limit.mockReturnValue(false)
    expect((await checkout(request('/api/checkout'))).status).toBe(429)
    expect(mocks.checkout).not.toHaveBeenCalled()
  })
})
