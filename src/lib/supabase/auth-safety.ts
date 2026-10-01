'use client'
import { fetchJson } from '../client-json'
export async function assertBrowserAuthAllowed() {
  const result = await fetchJson<{ mutationsAllowed: boolean }>('/api/auth/safety', { cache: 'no-store' })
  if (result.mutationsAllowed !== true) throw new Error('Sign-in is unavailable until the staging backend is connected.')
}
