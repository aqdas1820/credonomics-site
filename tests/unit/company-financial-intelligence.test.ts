import { describe, expect, it } from 'vitest'
import { financialGrowth, financialMargin } from '../../src/domain/equity/financial-intelligence'
describe('company financial normalization', () => {
  it('calculates valid growth and margins', () => { expect(financialGrowth(120, 100)).toBe(20); expect(financialMargin(25, 100)).toBe(25) })
  it('does not calculate from missing or zero bases', () => { expect(financialGrowth(10, 0)).toBeNull(); expect(financialGrowth(null, 10)).toBeNull(); expect(financialMargin(10, 0)).toBeNull() })
  it('handles loss-to-profit growth without dividing by a signed base', () => { expect(financialGrowth(20, -10)).toBe(300) })
})
