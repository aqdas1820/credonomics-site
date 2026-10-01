import 'server-only';
import { SECTORS, SECTOR_CONSTITUENTS } from '../../../app/data/sectors';
import type { SectorModel, SectorConstituent } from '../../domain/research/sector-intelligence';
import { getCompanyFinancialIntelligence } from '../market-data/company-financial-intelligence';
import { findInstrument } from '../market-data/instrument-master';

export class SectorIntelligenceService {
  static async getSectorIntelligence(slug: string): Promise<SectorModel | null> {
    const sectorDef = SECTORS.find(s => s.slug === slug);
    if (!sectorDef) return null;

    const symbols = SECTOR_CONSTITUENTS[slug] || [];
    // Process constituents sequentially or small batch to avoid limits, but we need fast response so we use Promise.all.
    // However, this might hit rate limits (429) if too many. Priority 12: Sector constituent N+1 calls audit.
    // Given the small size, Promise.all is acceptable, but let's safely catch errors.
    const results = await Promise.allSettled(symbols.map(async symbol => {
      const instrument = findInstrument('NSE', symbol);
      if (!instrument) return null;
      
      const financials = await getCompanyFinancialIntelligence(instrument.instrumentKey);
      if (!financials) return null;

      const latestQ = financials.historicalQuarterly?.[0];
      const prevQ = financials.historicalQuarterly?.[1];

      let revGrowth = null;
      let profitGrowth = null;
      if (latestQ && prevQ && latestQ.revenue && prevQ.revenue) {
         revGrowth = ((latestQ.revenue - prevQ.revenue) / prevQ.revenue) * 100;
      }
      if (latestQ && prevQ && latestQ.netProfit && prevQ.netProfit) {
         profitGrowth = ((latestQ.netProfit - prevQ.netProfit) / Math.abs(prevQ.netProfit)) * 100;
      }

      const getRatio = (match: RegExp) => financials.ratios.find(x => match.test(x.label))?.value ?? null;
      
      return {
        instrumentKey: instrument.instrumentKey,
        symbol: instrument.symbol,
        companyName: instrument.companyName,
        marketCap: getRatio(/market cap/i),
        pe: getRatio(/^P\/E$/i),
        pb: getRatio(/^P\/B$/i),
        roe: getRatio(/^ROE$/i),
        revenueGrowth: revGrowth,
        profitGrowth: profitGrowth,
        reportingPeriod: latestQ?.periodLabel ?? null
      } as SectorConstituent;
    }));

    const validConstituents = results
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter((c): c is SectorConstituent => c !== null);

    // Aggregate metrics
    const sortedPE = validConstituents.map(c => c.pe).filter((v): v is number => v !== null).sort((a,b) => a-b);
    const sortedPB = validConstituents.map(c => c.pb).filter((v): v is number => v !== null).sort((a,b) => a-b);
    const sortedROE = validConstituents.map(c => c.roe).filter((v): v is number => v !== null).sort((a,b) => a-b);
    
    const median = (arr: number[]) => {
      if (arr.length === 0) return null;
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };

    const totalMarketCap = validConstituents.reduce((sum, c) => sum + (c.marketCap || 0), 0);

    return {
      sectorName: sectorDef.name,
      slug: sectorDef.slug,
      constituentCount: validConstituents.length,
      aggregateMetrics: {
        medianPE: median(sortedPE),
        medianPB: median(sortedPB),
        medianROE: median(sortedROE),
        totalMarketCap: totalMarketCap > 0 ? totalMarketCap : null
      },
      constituents: validConstituents,
      source: 'CredoNomics Sector Aggregation',
      asOf: null,
      generatedAt: new Date().toISOString(),
      quality: 'verified',
      availability: 'recent'
    };
  }
}
