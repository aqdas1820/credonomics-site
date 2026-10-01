import { describe, expect, it } from 'vitest';
import { withProvenance, unknownDelivery } from '../../src/domain/provenance';

describe('Financial Provenance and Timestamp Rules', () => {
  it('does not masquerade render or fetch time as observation time', () => {
    const fetchedAt = new Date().toISOString();
    const result = withProvenance(
      { asOf: null, availability: 'live' },
      { delivery: 'provider', fetchedAt, cachedAt: null },
      true,
      new Date(fetchedAt)
    );
    expect(result.asOf).toBeNull();
    expect(result.observationTimestamp).toBeNull();
    expect(result.fetchedAt).toBe(fetchedAt);
    expect(result.status).toBe('UNKNOWN');
  });

  it('labels cached live data as CACHED, not LIVE', () => {
    const observationTime = new Date(Date.now() - 5000).toISOString(); // 5 seconds ago
    const cachedAt = new Date(Date.now() - 2000).toISOString();
    const result = withProvenance(
      { asOf: observationTime, availability: 'live' },
      { delivery: 'cache', fetchedAt: cachedAt, cachedAt },
      true,
      new Date()
    );
    expect(result.status).toBe('CACHED');
    expect(result.observationTimestamp).toBe(observationTime);
    expect(result.availability).toBe('recent'); // Fallback for live cached data
  });

  it('labels stale data as STALE and sets staleReason', () => {
    const staleTime = new Date(Date.now() - 86400000 * 35).toISOString(); // 35 days ago
    const result = withProvenance(
      { asOf: staleTime, availability: 'live' }, // Provider claimed live
      unknownDelivery,
      true,
      new Date()
    );
    expect(result.status).toBe('STALE');
    expect(result.isStale).toBe(true);
    expect(result.staleReason).not.toBeNull();
  });

  it('identifies aged live data as DELAYED', () => {
    const delayedTime = new Date(Date.now() - 150000).toISOString(); // 2.5 minutes ago (> 120s)
    const result = withProvenance(
      { asOf: delayedTime, availability: 'live' },
      unknownDelivery,
      true,
      new Date()
    );
    expect(result.status).toBe('DELAYED');
    expect(result.availability).toBe('delayed');
  });

  it('missing provider timestamp does not create a fake timestamp', () => {
    const result = withProvenance(
      { asOf: null, availability: 'live' },
      unknownDelivery,
      true,
      new Date()
    );
    expect(result.asOf).toBeNull();
    expect(result.observationTimestamp).toBeNull();
    expect(result.status).toBe('UNKNOWN');
  });

  it('returns UNAVAILABLE when hasData is false', () => {
    const result = withProvenance(
      { asOf: null, availability: 'unavailable' },
      unknownDelivery,
      false,
      new Date()
    );
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.availability).toBe('unavailable');
  });
});
