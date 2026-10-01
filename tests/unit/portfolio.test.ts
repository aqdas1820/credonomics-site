import { describe, it, expect } from 'vitest';
import { HoldingsEngine } from '../../src/domain/portfolio/HoldingsEngine';
import { PortfolioAnalytics } from '../../src/domain/portfolio/PortfolioAnalytics';
import { PortfolioTransaction } from '../../src/domain/portfolio/types';

describe('Portfolio HoldingsEngine', () => {
  it('calculates average cost and unrealized PnL correctly for multiple buys', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        id: '2', portfolioId: 'p1', date: '2023-01-10', type: 'BUY',
        quantity: 5, price: 130, grossAmount: 650, tax: 0, netAmount: 650, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>([['TCS', 150]]);
    const holdings = engine.deriveHoldings(transactions, prices);

    expect(holdings.length).toBe(1);
    const tcs = holdings[0];
    expect(tcs.quantity).toBe(15);
    // (10 * 100 + 5 * 130) / 15 = 1650 / 15 = 110
    expect(tcs.averageCost).toBe(110);
    expect(tcs.investedValue).toBe(1650);
    expect(tcs.currentPrice).toBe(150);
    expect(tcs.currentValue).toBe(2250);
    expect(tcs.unrealizedPnL).toBe(2250 - 1650); // 600
  });

  it('handles partial sell correctly', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        id: '2', portfolioId: 'p1', date: '2023-01-10', type: 'SELL',
        quantity: 5, price: 130, grossAmount: 650, tax: 0, netAmount: 650, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>([['TCS', 150]]);
    const holdings = engine.deriveHoldings(transactions, prices);

    expect(holdings.length).toBe(1);
    const tcs = holdings[0];
    expect(tcs.quantity).toBe(5);
    expect(tcs.averageCost).toBe(100); // Sell doesn't change average cost
    expect(tcs.investedValue).toBe(500);
  });

  it('filters out full exits', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        id: '2', portfolioId: 'p1', date: '2023-01-10', type: 'SELL',
        quantity: 10, price: 130, grossAmount: 1300, tax: 0, netAmount: 1300, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>([['TCS', 150]]);
    const holdings = engine.deriveHoldings(transactions, prices);

    expect(holdings.length).toBe(0); // quantity is 0
  });

  it('handles splits properly (increases qty, reduces avg cost)', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        // 1:1 split (adds 10 shares)
        id: '2', portfolioId: 'p1', date: '2023-01-10', type: 'SPLIT',
        quantity: 10, price: 0, grossAmount: 0, tax: 0, netAmount: 0, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>([['TCS', 50]]);
    const holdings = engine.deriveHoldings(transactions, prices);

    expect(holdings.length).toBe(1);
    const tcs = holdings[0];
    expect(tcs.quantity).toBe(20);
    expect(tcs.averageCost).toBe(50); // Total cost 1000 / 20 shares
  });

  it('handles missing current price safely', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>(); // Empty prices
    const holdings = engine.deriveHoldings(transactions, prices);

    expect(holdings.length).toBe(1);
    const tcs = holdings[0];
    expect(tcs.quantity).toBe(10);
    expect(tcs.currentPrice).toBe(null);
    expect(tcs.currentValue).toBe(null);
    expect(tcs.unrealizedPnL).toBe(null);
    expect(tcs.availability).toBe('UNAVAILABLE');
  });

  it('calculates realized PnL correctly', () => {
    const engine = new HoldingsEngine();
    
    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        id: '2', portfolioId: 'p1', date: '2023-01-10', type: 'SELL',
        quantity: 5, price: 130, grossAmount: 650, tax: 0, netAmount: 650, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      }
    ];

    const result = engine.calculateRealizedPnL(transactions);
    expect(result.realizedPnL).toBe((130 - 100) * 5); // 150
  });
});

describe('PortfolioAnalytics', () => {
  it('computes concentration and snapshots properly', () => {
    const engine = new HoldingsEngine();
    const analytics = new PortfolioAnalytics();

    const transactions: PortfolioTransaction[] = [
      {
        id: '1', portfolioId: 'p1', date: '2023-01-01', type: 'BUY',
        quantity: 10, price: 100, grossAmount: 1000, tax: 0, netAmount: 1000, fees: 0,
        instrument: { instrumentKey: 'TCS', symbol: 'TCS', exchange: 'NSE' }
      },
      {
        id: '2', portfolioId: 'p1', date: '2023-01-02', type: 'BUY',
        quantity: 20, price: 200, grossAmount: 4000, tax: 0, netAmount: 4000, fees: 0,
        instrument: { instrumentKey: 'INFY', symbol: 'INFY', exchange: 'NSE' }
      }
    ];

    const prices = new Map<string, number>([
      ['TCS', 150],
      ['INFY', 250]
    ]);

    const holdings = engine.deriveHoldings(transactions, prices);
    // TCS: 10 * 150 = 1500
    // INFY: 20 * 250 = 5000
    // Total = 6500

    holdings.find(h => h.instrument.instrumentKey === 'TCS')!.sector = 'IT';
    holdings.find(h => h.instrument.instrumentKey === 'INFY')!.sector = 'IT';

    const snapshot = analytics.createSnapshot('p1', holdings, transactions, '2023-01-03');

    expect(snapshot.currentValue).toBe(6500);
    expect(snapshot.investedValue).toBe(5000); // 1000 + 4000
    expect(snapshot.unrealizedPnL).toBe(1500);

    const concentration = analytics.calculateConcentration(holdings);
    expect(concentration.top1).toBe((5000 / 6500) * 100);
  });
});
