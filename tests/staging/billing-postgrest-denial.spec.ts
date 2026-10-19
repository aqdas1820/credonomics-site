import { test, expect } from '@playwright/test'

/**
 * READ-ONLY staging PostgREST negative tests. Never run against production.
 *
 * These tests do not create users, mutate data, call billing RPCs or emit
 * tokens. They are opt-in and MUST be run only after verified recovery,
 * approved exact-staging migration and explicit hosted E2E authorization.
 *
 * A 404/406 from an unexposed private schema proves API inaccessibility,
 * NOT that RLS has been independently exercised. A separate authorized
 * catalog/role test and actual application E2E are required.
 */
const projectRef = 'jvpiulmcjjnsgozgqgzw'
const expectedApi = `https://${projectRef}.supabase.co`
const approved = process.env.BILLING_STAGING_E2E_APPROVED === projectRef
const apiUrl = process.env.BILLING_STAGING_SUPABASE_URL?.replace(/\/$/, '')
const anonKey = process.env.BILLING_STAGING_PUBLISHABLE_KEY
const userJwt = process.env.BILLING_STAGING_NONADMIN_JWT

if (approved && apiUrl && apiUrl !== expectedApi) {
  throw new Error('Exact CredoNomics staging API origin required; no remote call performed')
}

test.skip(!approved || apiUrl !== expectedApi, 'Requires verified backup, exact staging approval and exact API origin')

const blocked = [401, 403, 404, 406]
const privateRelations = ['invoices', 'invoice_lines', 'bank_credit_evidence', 'audit_events', 'receipts']

test('anonymous identity cannot read billing-private relations over PostgREST', async ({ playwright }) => {
  test.skip(!anonKey, 'Requires owner-private staging publishable/anon key')
  const api = await playwright.request.newContext({
    baseURL: expectedApi,
    extraHTTPHeaders: { apikey: anonKey!, 'Accept-Profile': 'billing_private' },
    ignoreHTTPSErrors: false,
  })
  try {
    for (const relation of privateRelations) {
      const response = await api.get(`/rest/v1/${relation}?select=*&limit=1`)
      expect(blocked, `Anonymous billing-private access to ${relation} must be denied`)
        .toContain(response.status())
    }
  } finally {
    await api.dispose()
  }
})

test('verified ordinary user cannot read billing-private relations over PostgREST', async ({ playwright }) => {
  test.skip(!anonKey || !userJwt, 'Requires owner-private staging key and ordinary-user JWT')
  const api = await playwright.request.newContext({
    baseURL: expectedApi,
    extraHTTPHeaders: { apikey: anonKey!, Authorization: `Bearer ${userJwt}`, 'Accept-Profile': 'billing_private' },
    ignoreHTTPSErrors: false,
  })
  try {
    // Validate the token before interpreting negative responses as authorization
    // evidence. Otherwise an expired/invalid token could falsely 'pass' the test.
    const identity = await api.get('/auth/v1/user')
    expect(identity.status(), 'Ordinary-user JWT must be currently valid').toBe(200)

    for (const relation of privateRelations) {
      const response = await api.get(`/rest/v1/${relation}?select=*&limit=1`)
      expect(blocked, `Ordinary user billing-private access to ${relation} must be denied`)
        .toContain(response.status())
    }
  } finally {
    await api.dispose()
  }
})
