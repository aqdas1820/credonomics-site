import { PortfolioHolding, PortfolioSnapshot, PortfolioTransaction } from './types';

export class PortfolioAnalytics {
  public createSnapshot(
    portfolioId: string, 
    holdings: PortfolioHolding[], 
    transactions: PortfolioTransaction[],
    date: string = new Date().toISOString()
  ): PortfolioSnapshot {
    
    let totalCurrentValue = 0;
    let totalInvestedValue = 0;
    let totalUnrealizedPnL = 0;
    let partialValuation = false;
    
    const sectorExposure: Record<string, { value: number; weight: number }> = {};
    const industryExposure: Record<string, { value: number; weight: number }> = {};

    for (const holding of holdings) {
      if (holding.currentValue !== null && holding.currentValue !== undefined) {
        totalCurrentValue += holding.currentValue;
        totalUnrealizedPnL += holding.unrealizedPnL || 0;
        
        // Sector exposure
        const sector = holding.sector || 'Unknown';
        if (!sectorExposure[sector]) sectorExposure[sector] = { value: 0, weight: 0 };
        sectorExposure[sector].value += holding.currentValue;
        
        // Industry exposure
        const industry = holding.industry || 'Unknown';
        if (!industryExposure[industry]) industryExposure[industry] = { value: 0, weight: 0 };
        industryExposure[industry].value += holding.currentValue;

      } else {
        partialValuation = true;
      }
      totalInvestedValue += holding.investedValue;
    }
    
    // Calculate weights based on available current value
    if (totalCurrentValue > 0) {
      for (const sector in sectorExposure) {
        sectorExposure[sector].weight = (sectorExposure[sector].value / totalCurrentValue) * 100;
      }
      for (const industry in industryExposure) {
        industryExposure[industry].weight = (industryExposure[industry].value / totalCurrentValue) * 100;
      }
    }

    // Top holdings by value
    const sortedHoldings = [...holdings]
      .filter(h => h.currentValue !== null)
      .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

    const topHoldings = sortedHoldings.slice(0, 10);
    
    // Top gainers / losers (by percent)
    const sortedByPercent = [...holdings]
      .filter(h => h.unrealizedPnLPercent !== null)
      .sort((a, b) => (b.unrealizedPnLPercent || 0) - (a.unrealizedPnLPercent || 0));

    const largestGainers = sortedByPercent.slice(0, 5);
    const largestLosers = [...sortedByPercent].reverse().slice(0, 5);
    
    // Realized PnL (basic average cost implementation)
    // Defer to HoldingsEngine for this in a real system, but can aggregate here
    const realizedPnL = this.calculateRealizedPnL(transactions);

    return {
      date,
      portfolioId,
      currentValue: partialValuation ? null : totalCurrentValue, // If partial, the total current value is unreliable
      investedValue: totalInvestedValue,
      unrealizedPnL: partialValuation ? null : totalUnrealizedPnL,
      realizedPnL,
      cash: null, // Defer cash implementation
      holdingsCount: holdings.length,
      topHoldings,
      sectorExposure,
      industryExposure,
      largestGainers,
      largestLosers
    };
  }

  private calculateRealizedPnL(transactions: PortfolioTransaction[]): number {
     const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
     let totalRealizedPnL = 0;
     const costTracker = new Map<string, { qty: number; avgCost: number }>();
 
     for (const tx of sorted) {
       const key = tx.instrument.instrumentKey;
       let tracker = costTracker.get(key);
       if (!tracker) {
         tracker = { qty: 0, avgCost: 0 };
         costTracker.set(key, tracker);
       }
 
       if (tx.type === 'BUY' || tx.type === 'TRANSFER_IN') {
         const totalCost = (tracker.qty * tracker.avgCost) + (tx.quantity * tx.price);
         tracker.qty += tx.quantity;
         if (tracker.qty > 0) {
           tracker.avgCost = totalCost / tracker.qty;
         }
       } else if (tx.type === 'SELL') {
         const pnl = (tx.price - tracker.avgCost) * tx.quantity;
         totalRealizedPnL += pnl;
         tracker.qty -= tx.quantity;
         if (tracker.qty <= 0) {
           tracker.qty = 0;
           tracker.avgCost = 0;
         }
       }
     }
     return totalRealizedPnL;
  }

  public calculateConcentration(holdings: PortfolioHolding[]) {
    const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    
    if (totalCurrentValue === 0) return { top1: 0, top3: 0, top5: 0, top10: 0 };

    const sorted = [...holdings]
      .filter(h => h.currentValue !== null)
      .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

    const sumTopN = (n: number) => sorted.slice(0, n).reduce((sum, h) => sum + (h.currentValue || 0), 0);

    return {
      top1: (sumTopN(1) / totalCurrentValue) * 100,
      top3: (sumTopN(3) / totalCurrentValue) * 100,
      top5: (sumTopN(5) / totalCurrentValue) * 100,
      top10: (sumTopN(10) / totalCurrentValue) * 100,
    };
  }

  public calculateAbsoluteReturn(investedValue: number, currentValue: number | null): number | null {
    if (currentValue === null || investedValue === 0) return null;
    return ((currentValue - investedValue) / investedValue) * 100;
  }
}
