import { describe, expect, it } from 'vitest'
import { isBillingUuid } from './uuid-policy'

const valid = '12345678-1234-4234-8234-123456789012'
describe('billing UUID identity policy', () => {
  it('accepts exact PostgreSQL UUID shape, case-insensitively', () => {
    expect(isBillingUuid(valid)).toBe(true)
    expect(isBillingUuid(valid.toUpperCase())).toBe(true)
  })
  it('rejects look-alike UUIDs with moved/missing separators', () => {
    expect(isBillingUuid('12345678-' + '-'.repeat(27))).toBe(false)
    expect(isBillingUuid(valid.replace(/-/g, ''))).toBe(false)
    expect(isBillingUuid(valid.slice(0, -1))).toBe(false)
  })
  it('rejects appended suffixes or whitespace', () => {
    expect(isBillingUuid(valid + '-extension')).toBe(false)
    expect(isBillingUuid(' ' + valid)).toBe(false)
  })
  it('rejects non-hex characters and unsafe values', () => {
    expect(isBillingUuid('z' + valid.slice(1))).toBe(false)
    for (const value of [undefined, null, {}, [], 42]) expect(isBillingUuid(value)).toBe(false)
  })
})
