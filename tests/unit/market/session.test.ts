import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getIndianMarketSession, marketSessionLabel } from '../../../src/domain/market/session';

describe('Market Session Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setTime = (isoString: string) => {
    vi.setSystemTime(new Date(isoString));
  };

  it('identifies weekends as CLOSED', () => {
    // 2026-09-05 is a Saturday, 2026-09-06 is Sunday
    setTime('2026-09-05T10:00:00+05:30'); 
    expect(getIndianMarketSession()).toBe('CLOSED');
    
    setTime('2026-09-06T10:00:00+05:30'); 
    expect(getIndianMarketSession()).toBe('CLOSED');
  });

  it('identifies weekdays before 9:00 AM IST as CLOSED', () => {
    // 2026-09-07 is a Monday
    setTime('2026-09-07T08:59:59+05:30');
    expect(getIndianMarketSession()).toBe('CLOSED');
  });

  it('identifies weekdays 9:00 AM - 9:15 AM IST as PRE_OPEN', () => {
    setTime('2026-09-07T09:00:00+05:30');
    expect(getIndianMarketSession()).toBe('PRE_OPEN');
    
    setTime('2026-09-07T09:14:59+05:30');
    expect(getIndianMarketSession()).toBe('PRE_OPEN');
  });

  it('identifies weekdays 9:15 AM - 3:30 PM IST as OPEN', () => {
    setTime('2026-09-07T09:15:00+05:30');
    expect(getIndianMarketSession()).toBe('OPEN');
    
    setTime('2026-09-07T15:29:59+05:30');
    expect(getIndianMarketSession()).toBe('OPEN');
  });

  it('identifies weekdays after 3:30 PM IST as CLOSED', () => {
    setTime('2026-09-07T15:30:00+05:30');
    expect(getIndianMarketSession()).toBe('CLOSED');
  });

  it('identifies declared holidays as HOLIDAY', () => {
    // Even if it's 10 AM on a Monday
    setTime('2026-09-07T10:00:00+05:30');
    const holidays = new Set(['2026-09-07']);
    expect(getIndianMarketSession(new Date(), holidays)).toBe('HOLIDAY');
  });
  
  it('correctly maps session labels', () => {
    expect(marketSessionLabel('OPEN')).toBe('MARKET OPEN');
    expect(marketSessionLabel('PRE_OPEN')).toBe('PRE-OPEN');
    expect(marketSessionLabel('HOLIDAY')).toBe('HOLIDAY');
    expect(marketSessionLabel('CLOSED')).toBe('MARKET CLOSED');
  });
});
