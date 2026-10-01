import { PortfolioTransaction, PortfolioHolding } from './types';

interface RealizedPnLResult {
  realizedPnL: number | null;
  // If we can't accurately track it because of missing cost basis from old transfers, this will be null
}

export class HoldingsEngine {
  /**
   * Derives current holdings from a list of transactions using Weighted-Average Cost.
   */
  public deriveHoldings(transactions: PortfolioTransaction[], currentPrices: Map<string, number>): PortfolioHolding[] {
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const holdingsMap = new Map<string, PortfolioHolding>();

    for (const tx of sorted) {
      const key = tx.instrument.instrumentKey;
      let holding = holdingsMap.get(key);

      if (!holding) {
        holding = {
          instrument: tx.instrument,
          quantity: 0,
          averageCost: 0,
          investedValue: 0,
          currentPrice: null,
          currentValue: null,
          unrealizedPnL: null,
          unrealizedPnLPercent: null,
          currency: 'INR',
          availability: 'UNAVAILABLE'
        };
        holdingsMap.set(key, holding);
      }

      switch (tx.type) {
        case 'BUY':
        case 'TRANSFER_IN': {
          const totalCost = (holding.quantity * holding.averageCost) + (tx.quantity * tx.price);
          holding.quantity += tx.quantity;
          if (holding.quantity > 0) {
            holding.averageCost = totalCost / holding.quantity;
          }
          break;
        }
        case 'SELL':
        case 'TRANSFER_OUT': {
          holding.quantity -= tx.quantity;
          if (holding.quantity <= 0) {
            holding.quantity = 0;
            holding.averageCost = 0;
          }
          break;
        }
        case 'SPLIT':
        case 'BONUS':
          // Adjusted quantity but cost basis total remains same
          // (average cost decreases)
          holding.quantity += tx.quantity; // tx.quantity here would be the net additional shares
          if (holding.quantity > 0) {
             const totalCost = (holding.quantity - tx.quantity) * holding.averageCost;
             holding.averageCost = totalCost / holding.quantity;
          }
          break;
        case 'DIVIDEND':
        case 'RIGHTS':
        case 'FEE':
        case 'TAX':
        case 'OTHER':
          // Typically don't adjust cost basis for cash dividends in standard equity accounting
          // Rights might add quantity at right's price
          break;
      }

      holding.investedValue = holding.quantity * holding.averageCost;
    }

    // Apply current prices and calculate unrealized PnL
    for (const holding of holdingsMap.values()) {
      const price = currentPrices.get(holding.instrument.instrumentKey);
      if (price !== undefined && price !== null) {
        holding.currentPrice = price;
        holding.currentValue = holding.quantity * price;
        holding.unrealizedPnL = holding.currentValue - holding.investedValue;
        if (holding.investedValue > 0) {
          holding.unrealizedPnLPercent = (holding.unrealizedPnL / holding.investedValue) * 100;
        }
        holding.availability = 'AVAILABLE';
      } else {
        holding.availability = 'UNAVAILABLE';
      }
    }

    // Filter out zero-quantity holdings (unless we want to show exited positions)
    return Array.from(holdingsMap.values()).filter(h => h.quantity > 0);
  }

  /**
   * Calculates realized PnL using standard average cost (or FIFO if explicitly provided).
   * Note: This is Portfolio Analytics PnL, not Tax Reporting PnL.
   */
  public calculateRealizedPnL(transactions: PortfolioTransaction[]): RealizedPnLResult {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalRealizedPnL = 0;
    
    // Track average cost per instrument over time
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
      } else if (tx.type === 'SPLIT' || tx.type === 'BONUS') {
        tracker.qty += tx.quantity;
        if (tracker.qty > 0) {
          const totalCost = (tracker.qty - tx.quantity) * tracker.avgCost;
          tracker.avgCost = totalCost / tracker.qty;
        }
      }
    }

    return { realizedPnL: totalRealizedPnL };
  }
}
