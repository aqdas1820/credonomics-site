import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getIpoDisplayStatus, ipoStatusLabel } from '../../../src/domain/ipo/display-status';

describe('IPO Display Status Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setTime = (isoString: string) => {
    vi.setSystemTime(new Date(isoString));
  };

  it('identifies IPOs listing today or past as listed', () => {
    setTime('2026-09-07T10:00:00+05:30');
    expect(getIpoDisplayStatus({ listingDate: '2026-09-07' })).toBe('listed');
    expect(getIpoDisplayStatus({ listingDate: '2026-09-05' })).toBe('listed');
  });

  it('identifies future open dates as announced', () => {
    setTime('2026-09-07T10:00:00+05:30');
    expect(getIpoDisplayStatus({ openDate: '2026-09-08' })).toBe('announced');
  });

  it('evaluates closing today vs recently closed at 5 PM IST strict cutoff', () => {
    // IPO closes today (2026-09-07)
    
    // 2:00 PM IST
    setTime('2026-09-07T14:00:00+05:30');
    expect(getIpoDisplayStatus({ closeDate: '2026-09-07' })).toBe('open');
    
    // 5:01 PM IST
    setTime('2026-09-07T17:01:00+05:30');
    expect(getIpoDisplayStatus({ closeDate: '2026-09-07' })).toBe('closed');
  });

  it('evaluates past close dates as closed', () => {
    setTime('2026-09-08T10:00:00+05:30');
    expect(getIpoDisplayStatus({ closeDate: '2026-09-07' })).toBe('closed');
  });

  it('evaluates open status during the bidding window', () => {
    setTime('2026-09-06T10:00:00+05:30');
    expect(getIpoDisplayStatus({ openDate: '2026-09-05', closeDate: '2026-09-07' })).toBe('open');
  });

  it('correctly maps status labels', () => {
    expect(ipoStatusLabel('announced')).toBe('Announced');
    expect(ipoStatusLabel('open')).toBe('Open');
    expect(ipoStatusLabel('closed')).toBe('Closed');
    expect(ipoStatusLabel('listed')).toBe('Listed');
  });
});
