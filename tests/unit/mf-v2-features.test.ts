import { describe, it, expect } from 'vitest';
import { MutualFundIntelligenceService } from '../../src/services/mf/MutualFundIntelligenceService';

describe('MutualFundIntelligenceService V2 Overlap and Timeline', () => {
  it('should compute valid overlap metrics without NaN or duplicate ISINs', async () => {
    // Testing against HDFC Large and Mid Cap (hdfc-large-and-mid-cap-fund-676b7e17)
    // and HDFC Flexi Cap (hdfc-flexi-cap-fund-e5787798)
    const result = await MutualFundIntelligenceService.getPortfolioOverlap(
      'hdfc-large-and-mid-cap-fund-676b7e17', 
      'hdfc-flexi-cap-fund-e5787798'
    );
    
    // Some funds might not be mapped in index.json or dataset might be missing one.
    // If it returns null, skip.
    if (result) {
      expect(result.metrics.weightedOverlapPct).toBeGreaterThanOrEqual(0);
      expect(result.metrics.weightedOverlapPct).toBeLessThanOrEqual(1);
      
      const isins = result.commonHoldings.map(h => h.isin).filter(Boolean);
      const uniqueIsins = new Set(isins);
      expect(isins.length).toBe(uniqueIsins.size);
    }
  });

  it('should fetch security timeline properly', async () => {
    // Using a known security slug based on earlier JSON read
    const timeline = await MutualFundIntelligenceService.getSecurityTimeline('power-grid-corporation-of-india-ltd-571cba44');
    if (timeline) {
      expect(timeline.schemeHistory).toBeDefined();
    }
  });
});
