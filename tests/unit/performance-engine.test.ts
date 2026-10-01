import { describe, it, expect } from 'vitest';
import { PerformanceEngine } from '../../src/domain/portfolio/PerformanceEngine';

describe('PerformanceEngine', () => {
  it('calculates absolute return correctly', () => {
    const engine = new PerformanceEngine();
    const result = engine.calculateAbsoluteReturn(1000, 1500);
    expect(result.status).toBe('AVAILABLE');
    expect(result.value).toBe(50);
  });

  it('rejects absolute return if price unavailable', () => {
    const engine = new PerformanceEngine();
    const result = engine.calculateAbsoluteReturn(1000, null);
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.value).toBe(null);
  });

  it('rejects CAGR if portfolio age < 1 year', () => {
    const engine = new PerformanceEngine();
    const result = engine.calculateCAGR(1000, 1500, new Date().toISOString());
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toMatch(/less than 1 year/);
  });

  it('handles XIRR insufficient history gracefully', () => {
    const engine = new PerformanceEngine();
    const result = engine.calculateXIRR([], [], 1500);
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.reason).toMatch(/Insufficient/);
  });
});
