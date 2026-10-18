import { describe, expect, it } from 'vitest'
import { isBillingAdmin } from './admin-policy'
const id = '12345678-1234-4234-8234-123456789012'
describe('billing admin authorization', () => {
  it('denies missing user', () => expect(isBillingAdmin(null, id)).toBe(false))
  it('denies missing allowlist', () => expect(isBillingAdmin({ id, app_metadata: { billing_admin: true } }, undefined)).toBe(false))
  it('denies absent trusted admin claim', () => expect(isBillingAdmin({ id }, id)).toBe(false))
  it('denies non-allowlisted admin', () => expect(isBillingAdmin({ id, app_metadata: { billing_admin: true } }, '87654321-1234-4234-8234-123456789012')).toBe(false))
  it('allows exact UUID and trusted admin claim', () => expect(isBillingAdmin({ id, app_metadata: { billing_admin: true } }, id)).toBe(true))
  it('denies invalid identity', () => expect(isBillingAdmin({ id: 'admin', app_metadata: { billing_admin: true } }, 'admin')).toBe(false))
  it('denies malformed UUID even when explicitly allowlisted', () => {
    const bad = '12345678-' + '-'.repeat(27)
    expect(isBillingAdmin({ id: bad, app_metadata: { billing_admin: true } }, bad)).toBe(false)
  })
  it('denies inherited admin claim and nonboolean claim', () => {
    expect(isBillingAdmin({ id, app_metadata: Object.create({ billing_admin: true }) }, id)).toBe(false)
    expect(isBillingAdmin({ id, app_metadata: { billing_admin: 'true' } }, id)).toBe(false)
  })
})
