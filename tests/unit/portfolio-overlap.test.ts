import { describe, it, expect } from 'vitest';
import { PortfolioOverlapService } from '../../src/services/portfolio/PortfolioOverlapService';
import { PortfolioHolding } from '../../src/domain/portfolio/types';

describe('PortfolioOverlapService', () => {
  it('calculates weighted overlap correctly', () => {
    const service = new PortfolioOverlapService();
    
    const holdings: PortfolioHolding[] = [
      {
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' },
        quantity: 10,
        averageCost: 100,
        investedValue: 1000,
        currentPrice: 150,
        currentValue: 1500, // 60%
        unrealizedPnL: 500,
        unrealizedPnLPercent: 50,
        currency: 'INR',
        availability: 'AVAILABLE'
      },
      {
        instrument: { instrumentKey: 'INFY', symbol: 'INFY', exchange: 'NSE' },
        quantity: 5,
        averageCost: 100,
        investedValue: 500,
        currentPrice: 200,
        currentValue: 1000, // 40%
        unrealizedPnL: 500,
        unrealizedPnLPercent: 100,
        currency: 'INR',
        availability: 'AVAILABLE'
      }
    ]; // Total = 2500

    const fund = [
      { instrumentKey: 'TCS', weight: 40 },
      { instrumentKey: 'INFY', weight: 50 }
    ];

    const result = service.calculatePortfolioVsFundOverlap(holdings, fund);
    
    // TCS port weight = 60%, fund = 40% -> min(60, 40) = 40
    // INFY port weight = 40%, fund = 50% -> min(40, 50) = 40
    // Total overlap = 80
    expect(result.commonSecurities).toBe(2);
    expect(result.weightedOverlap).toBe(80);
    expect(result.largestSharedExposures.length).toBe(2);
  });
});
