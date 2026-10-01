import { describe, expect, it } from 'vitest'
import { safeRedirectPath } from '../../src/lib/auth-redirect'
import { serializeJsonLd } from '../../src/lib/json-ld'
import { providerNumber, providerDate, transformUpstoxCandles } from '../../src/providers/market/upstox-transform'
import { getIpoDisplayStatus } from '../../src/domain/ipo/display-status'
import { calculateIpoDataScore } from '../../app/data/ipo-engine'
import type { VerifiedIpoRecord } from '../../app/data/ipo-types'
import { boundedNumber } from '../../src/lib/calculator-input'
import { formatINR } from '../../src/lib/financial-format'

describe('security regressions', () => {
  it.each(['https://evil.example', '//evil.example', '/\\evil.example', '/\nevil.example', 'javascript:alert(1)'])('rejects an external redirect %s', input => expect(safeRedirectPath(input)).toBe('/account'))
  it('preserves local return destinations', () => expect(safeRedirectPath('/pricing?plan=pro')).toBe('/pricing?plan=pro'))
  it('escapes script termination while preserving JSON values', () => {
    const value = { name: '</script><script>alert(1)</script>' }
    const serialized = serializeJsonLd(value)
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual(value)
  })
})
describe('financial integrity regressions', () => {
  it.each(['', ' ', 'N/A', null, undefined, Infinity])('does not coerce missing provider values to zero: %s', value => expect(providerNumber(value)).toBeNull())
  it('retains genuine zero and formatted numbers', () => { expect(providerNumber('0')).toBe(0); expect(providerNumber('1,234.56')).toBe(1234.56) })
  it('parses provider timestamps in seconds and milliseconds', () => {
    expect(providerDate(1704067200000)).toBe('2024-01-01T00:00:00.000Z')
    expect(providerDate('1704067200')).toBe('2024-01-01T00:00:00.000Z')
    expect(providerDate('not-a-date')).toBeNull()
  })
  it('rejects invalid dates and inconsistent OHLC values', () => {
    expect(transformUpstoxCandles([['bad', 10, 20, 5, 15, 100], ['2026-01-01', 10, 9, 5, 15, 100], ['2026-01-01', 10, 20, 5, 15, -1]])).toEqual([])
  })
  it('preserves paise in quoted prices', () => expect(formatINR(123.45)).toContain('123.45'))
  it('keeps withdrawn IPOs out of live and listed categories', () => expect(getIpoDisplayStatus({ providerStatus: 'withdrawn', listingDate: '2020-01-01' })).toBe('withdrawn'))
  it('does not treat invalid dates as real listing dates', () => expect(getIpoDisplayStatus({ listingDate: '2026-02-31' }, new Date('2026-04-01'))).toBe('unknown'))
  it('uses elapsed fiscal years instead of row count for CAGR', () => {
    const record = { financials: [{ period: 'FY2026', revenueCr: 121 }, { period: 'FY2024', revenueCr: 100 }] } as VerifiedIpoRecord
    expect(calculateIpoDataScore(record).revenueCagr).toBeCloseTo(10)
    expect(calculateIpoDataScore({ ...record, financials: [record.financials[0]] }).revenueCagr).toBeUndefined()
  })
  it('bounds calculator values from editable URLs', () => {
    expect(boundedNumber('NaN', 100)).toBe(100)
    expect(boundedNumber('Infinity', 100)).toBe(100)
    expect(boundedNumber('-20', 100)).toBe(0)
    expect(boundedNumber('500', 5, 100)).toBe(100)
  })
})
