import { getCompanyFinancialIntelligence } from '../market-data/company-financial-intelligence';
import { searchInstrumentMaster } from '../market-data/instrument-master';
import { SECTORS, SECTOR_CONSTITUENTS } from '../../../app/data/sectors';
import { ScreenerEngine } from '../../domain/screener/ScreenerEngine';
import type { ScreenerQuery, ScreenerResult, ScreenerResultItem } from '../../domain/screener/types';

export class ScreenerService {
  private engine = new ScreenerEngine();

  private getScreenerUniverse(): string[] {
    // Collect all constituents across all sectors
    const universe = new Set<string>();
    for (const sector of SECTORS) {
      const symbols = SECTOR_CONSTITUENTS[sector.slug as keyof typeof SECTOR_CONSTITUENTS] || [];
      for (const symbol of symbols) {
        universe.add(symbol);
      }
    }
    
    // Convert symbols to instrument keys using instrument master
    const keys = new Set<string>();
    for (const symbol of universe) {
       const hit = searchInstrumentMaster(symbol, 1);
       if (hit && hit.length > 0) {
          keys.add(hit[0].instrumentKey);
       }
    }
    
    return Array.from(keys);
  }

  public async screen(query: ScreenerQuery): Promise<ScreenerResult> {
    const universe = this.getScreenerUniverse();
    const evaluated: ScreenerResultItem[] = [];
    
    // We fetch financials for the entire universe, but realistically in production 
    // we would use a cached/batch endpoint or read model.
    // For now we will fetch them in parallel with Promise.allSettled.
    const promises = universe.map(async (key) => {
       const company = await getCompanyFinancialIntelligence(key);
       if (!company) return null;

       const passed = this.engine.evaluate(company, query);
       if (passed) {
          return {
             instrumentKey: company.instrumentKey,
             symbol: company.symbol,
             companyName: company.companyName,
             sector: company.sector ?? 'Unknown',
             price: company.ratios.find(r => r.key === 'current_price')?.value ?? null,
             marketCap: company.ratios.find(r => r.key === 'market_cap')?.value ?? null,
             pe: company.ratios.find(r => r.key === 'pe_ratio')?.value ?? null,
             pb: company.ratios.find(r => r.key === 'pb_ratio')?.value ?? null,
             revenueGrowthYoY: company.quarterly?.[0]?.yoy ?? null,
             profitGrowthYoY: null, // Computed inside the engine if requested
             roe: company.ratios.find(r => r.key === 'roe')?.value ?? null,
             roce: company.ratios.find(r => r.key === 'roce')?.value ?? null,
             debtToEquity: company.ratios.find(r => r.key === 'debt_to_equity')?.value ?? null,
             promoterHolding: company.shareholding?.[0]?.promoter ?? null,
             fiiHolding: company.shareholding?.[0]?.fii ?? null,
             diiHolding: company.shareholding?.[0]?.dii ?? null,
             latestReportingPeriod: company.reportingPeriod ?? null,
             dataFreshness: 'recent'
          } as ScreenerResultItem;
       }
       return null;
    });

    const results = await Promise.allSettled(promises);
    
    results.forEach(res => {
       if (res.status === 'fulfilled' && res.value !== null) {
          evaluated.push(res.value);
       }
    });
    
    // Apply sorting
    if (query.sortBy) {
       evaluated.sort((a, b) => {
          const valA = (a as unknown as Record<string, number | null>)[query.sortBy!] ?? -Infinity;
          const valB = (b as unknown as Record<string, number | null>)[query.sortBy!] ?? -Infinity;
          
          if (valA === valB) return 0;
          const direction = query.sortDirection === 'asc' ? 1 : -1;
          return valA > valB ? direction : -direction;
       });
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const paginated = evaluated.slice(offset, offset + limit);

    return {
       items: paginated,
       totalEvaluated: universe.length,
       totalMatched: evaluated.length,
       dataCoverage: {
          financials: 'current',
          shareholding: 'recent',
          price: 'recent'
       }
    };
  }
}

export const screenerService = new ScreenerService();
