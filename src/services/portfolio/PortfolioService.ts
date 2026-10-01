import { HoldingsEngine } from '../../domain/portfolio/HoldingsEngine';
import { PortfolioAnalytics } from '../../domain/portfolio/PortfolioAnalytics';
import { Portfolio, PortfolioTransaction, PortfolioHolding, PortfolioDataCoverage } from '../../domain/portfolio/types';
import { getOwnershipChanges } from '../research/OwnershipScannerService';
import { getCorporateActions } from '../research/CorporateActionScanner';
import { getRecentResults } from '../research/ResultsIntelligenceService';

export class PortfolioService {
  private holdingsEngine = new HoldingsEngine();
  private analytics = new PortfolioAnalytics();

  /**
   * Generates a full portfolio analysis from raw transactions and current prices.
   * This is entirely independent of persistence (auth-independent).
   */
  public analyzePortfolio(
    portfolioId: string, 
    transactions: PortfolioTransaction[], 
    currentPrices: Map<string, number>
  ): Portfolio {
    
    const holdings = this.holdingsEngine.deriveHoldings(transactions, currentPrices);
    const snapshot = this.analytics.createSnapshot(portfolioId, holdings, transactions);
    this.analytics.calculateConcentration(holdings); // calculated but omitted from base Portfolio in mock
    
    // Coverage approximation (in a real system this would check price history DB)
    const coverage: PortfolioDataCoverage = {
      transactionCoverage: 'COMPLETE', // Assumed from import
      instrumentMapping: 'COMPLETE',
      priceCoverage: snapshot.currentValue !== null ? 'COMPLETE' : 'PARTIAL',
      sectorMapping: 'COMPLETE',
      corporateActions: 'COMPLETE',
      historicalPriceCoverage: 'UNAVAILABLE', // Placeholder for now
      resultsCoverage: 'COMPLETE'
    };

    return {
      id: portfolioId,
      name: 'Imported Portfolio',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      holdings,
      transactions,
      cashFlows: [], // Deferred
      coverage,
      currency: 'INR'
    };
  }

  /**
   * Returns recent events (dividends, results, corporate actions) for the portfolio holdings.
   */
  public async getPortfolioEvents(holdings: PortfolioHolding[]) {
    const symbols = holdings.map(h => h.instrument.symbol);
    const allCorporateActions = await getCorporateActions();
    const corporateActions = allCorporateActions.filter(a => symbols.includes(a.symbol));
    const allResults = await getRecentResults();
    const results = allResults.filter(r => symbols.includes(r.symbol));

    return {
      corporateActions,
      results
    };
  }

  /**
   * Returns ownership changes for the portfolio holdings.
   */
  public async getPortfolioOwnershipChanges(holdings: PortfolioHolding[]) {
    const symbols = holdings.map(h => h.instrument.symbol);
    const changes = await getOwnershipChanges();
    return changes.filter(c => symbols.includes(c.symbol));
  }
}
