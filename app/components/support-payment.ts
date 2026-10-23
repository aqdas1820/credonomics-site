import type { SupportAmount } from './support-logic'

export async function supportConfirmation(request: typeof fetch = fetch): Promise<'SUCCESS' | 'PENDING' | null> {
  try {
    const response = await request('/api/contributions/confirmation', { credentials: 'same-origin', cache: 'no-store' })
    if (!response.ok) return null
    const data = await response.json()
    return data.status === 'SUCCESS' || data.status === 'PENDING' ? data.status : null
  } catch { return null }
}

// No gateway key or Core URL crosses the browser boundary.
export async function initiateSupport(amount: SupportAmount, nonce: string, request: typeof fetch = fetch): Promise<string | null> {
  try {
    const response = await request('/api/contributions', { method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': nonce }, body: JSON.stringify({ amount }) })
    if (!response.ok) return null
    const result = await response.json()
    const url = new URL(result.checkoutUrl)
    if (url.origin !== 'https://pay.credonomics.in' || !/^\/checkout\/[0-9a-f-]{36}$/i.test(url.pathname) || url.search || url.hash || url.username || url.password) return null
    return result.checkoutUrl
  } catch { return null }
}
