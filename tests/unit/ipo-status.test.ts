import { describe, expect, it } from 'vitest'
import { getIpoDisplayStatus } from '../../src/domain/ipo/display-status'

describe('canonical IPO display status', () => {
  it('uses Asia/Kolkata dates before provider status', () => {
    expect(getIpoDisplayStatus({
      openDate: '2026-09-02',
      closeDate: '2026-09-04',
      providerStatus: 'open',
    }, new Date('2026-09-01T18:29:00.000Z'))).toBe('upcoming')
  })

  it('marks an issue open between its opening and closing dates', () => {
    expect(getIpoDisplayStatus({
      openDate: '2026-08-31',
      closeDate: '2026-09-02',
      providerStatus: 'closed',
    }, new Date('2026-09-01T06:30:00.000Z'))).toBe('open')
  })

  it('shows closing today before the fallback bidding cutoff', () => {
    expect(getIpoDisplayStatus({
      openDate: '2026-08-28',
      closeDate: '2026-09-01',
      providerStatus: 'open',
    }, new Date('2026-09-01T10:30:00.000Z'))).toBe('closing_today')
  })

  it('closes at the fallback cutoff even when the provider remains open', () => {
    expect(getIpoDisplayStatus({
      openDate: '2026-08-28',
      closeDate: '2026-09-01',
      providerStatus: 'open',
    }, new Date('2026-09-01T11:30:00.000Z'))).toBe('closed')
  })

  it('honours an authoritative bidding end timestamp', () => {
    expect(getIpoDisplayStatus({
      openDate: '2026-09-01',
      closeDate: '2026-09-01',
      biddingEndAt: '2026-09-01T16:00:00+05:30',
      providerStatus: 'open',
    }, new Date('2026-09-01T10:31:00.000Z'))).toBe('closed')
  })

  it('marks a record listed only when its authoritative listing date arrives', () => {
    expect(getIpoDisplayStatus({
      closeDate: '2026-08-28',
      listingDate: '2026-09-01',
      providerStatus: 'closed',
    }, new Date('2026-08-31T18:31:00.000Z'))).toBe('listed')
  })
})
