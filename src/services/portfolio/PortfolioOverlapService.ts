import { PortfolioHolding } from '../../domain/portfolio/types';

export class PortfolioOverlapService {
  /**
   * Calculates factual overlap between a Portfolio and a Mutual Fund (represented as an array of instrument keys/weights)
   */
  public calculatePortfolioVsFundOverlap(portfolioHoldings: PortfolioHolding[], fundHoldings: { instrumentKey: string; weight: number }[]) {
    // Determine portfolio weights first
    const totalPortfolioValue = portfolioHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    
    if (totalPortfolioValue === 0) return { commonSecurities: 0, weightedOverlap: 0, largestSharedExposures: [] };

    const portfolioWeights = new Map<string, number>();
    for (const h of portfolioHoldings) {
      if (h.currentValue !== null) {
        portfolioWeights.set(h.instrument.instrumentKey, (h.currentValue / totalPortfolioValue) * 100);
      }
    }

    const fundWeights = new Map<string, number>();
    for (const fh of fundHoldings) {
      fundWeights.set(fh.instrumentKey, fh.weight);
    }

    let commonSecurities = 0;
    let weightedOverlap = 0;
    const sharedExposures: { instrumentKey: string; overlapWeight: number }[] = [];

    for (const [instrumentKey, portWeight] of portfolioWeights.entries()) {
      const fundWeight = fundWeights.get(instrumentKey);
      if (fundWeight !== undefined) {
        commonSecurities++;
        const overlap = Math.min(portWeight, fundWeight);
        weightedOverlap += overlap;
        sharedExposures.push({ instrumentKey, overlapWeight: overlap });
      }
    }

    sharedExposures.sort((a, b) => b.overlapWeight - a.overlapWeight);

    return {
      commonSecurities,
      weightedOverlap,
      largestSharedExposures: sharedExposures.slice(0, 10)
    };
  }
}
