import fs from 'fs/promises';
import path from 'path';
import { Holding, HoldingChangeStatus, MFPortfolioData, PortfolioOverlapResult, SchemeIdentity } from '../../domain/mf/types';
import { MutualFundTrustMetadata } from '../../schemas/mutual-fund';

const DATA_ROOT = path.join(process.cwd(), 'public', 'data', 'mf-intelligence', 'v2');

interface RawIndexData {
  latestMonth?: string;
  months?: string[];
  schemes?: Array<{ scheme: string; category: string; slug: string }>;
  trustMetadata?: MutualFundTrustMetadata;
}

interface RawHolding {
  amc: string;
  scheme: string;
  category: string;
  month: string;
  securityId: string;
  slug: string;
  isin: string | null;
  stock: string;
  sector: string;
  weight: number;
  quality: string;
  sourceFile: string;
}

interface RawMonthData {
  month: string;
  metadata: unknown;
  schemes: string[];
  holdings: RawHolding[];
}

export class MutualFundIntelligenceService {
  /**
   * Retrieves the comprehensive portfolio data for a specific mutual fund scheme.
   * Compares the latest available month with the previous month to calculate holding changes.
   */
  static async getSchemePortfolio(schemeId: string): Promise<MFPortfolioData | null> {
    try {
      const indexRaw = await fs.readFile(path.join(DATA_ROOT, 'index.json'), 'utf8');
      const index: RawIndexData = JSON.parse(indexRaw);

      const schemeMeta = index.schemes?.find(s => s.slug === schemeId || s.scheme === schemeId);
      if (!schemeMeta) {
        return null; // Scheme not found
      }

      const latestMonth = index.latestMonth;
      if (!latestMonth) return null;

      const monthIdx = index.months?.indexOf(latestMonth) ?? -1;
      const prevMonth = monthIdx >= 1 ? index.months![monthIdx - 1] : null;

      const currentData = await this.readMonthData(latestMonth);
      if (!currentData) return null;

      const previousData = prevMonth ? await this.readMonthData(prevMonth) : null;

      // Extract current holdings for the specific scheme
      const currentHoldings = currentData.holdings.filter(h => h.scheme === schemeMeta.scheme);
      const previousHoldings = previousData?.holdings.filter(h => h.scheme === schemeMeta.scheme) || [];

      const prevHoldingsMap = new Map(previousHoldings.map(h => [h.securityId, h]));

      // 1. Process Current Holdings & Calculate MoM Changes
      const domainHoldings: Holding[] = [];
      let top5Weight = 0;
      let top10Weight = 0;

      // Sort by weight descending
      currentHoldings.sort((a, b) => b.weight - a.weight);

      currentHoldings.forEach((h, idx) => {
        const prev = prevHoldingsMap.get(h.securityId);
        let status: HoldingChangeStatus = 'NEW';
        let weightChange = 0;

        if (prev) {
          weightChange = h.weight - prev.weight;
          if (weightChange > 0.05) status = 'INCREASED';
          else if (weightChange < -0.05) status = 'DECREASED';
          else status = 'UNCHANGED';
        }

        domainHoldings.push({
          instrumentName: h.stock,
          isin: h.isin ?? undefined,
          instrumentType: 'Equity', // Hardcoding to Equity for now based on dataset
          weight: h.weight,
          sector: h.sector || 'Unclassified',
          
          quality: h.quality,
          source: 'HDFC Mutual Fund official disclosures',
          sourceDocument: h.sourceFile,
          sourceDate: h.month,

          changeStatus: status,
          previousWeight: prev?.weight,
          weightChange: weightChange,
        });

        if (idx < 5) top5Weight += h.weight;
        if (idx < 10) top10Weight += h.weight;
      });

      // 2. Add Exited Holdings
      previousHoldings.forEach(prev => {
        const stillExists = currentHoldings.some(h => h.securityId === prev.securityId);
        if (!stillExists) {
          domainHoldings.push({
            instrumentName: prev.stock,
            isin: prev.isin ?? undefined,
            instrumentType: 'Equity',
            weight: 0,
            sector: prev.sector || 'Unclassified',
            
            quality: prev.quality,
            source: 'HDFC Mutual Fund official disclosures',
            sourceDocument: prev.sourceFile,
            sourceDate: latestMonth, // It exited in the current month

            changeStatus: 'EXITED',
            previousWeight: prev.weight,
            weightChange: -prev.weight,
          });
        }
      });

      // 3. Sector Overlap / Aggregation
      const sectorMap = new Map<string, number>();
      currentHoldings.forEach(h => {
        sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.weight);
      });
      const sectors = Array.from(sectorMap.entries())
        .map(([sector, weight]) => ({ sector, weight }))
        .sort((a, b) => b.weight - a.weight);

      const identity: SchemeIdentity = {
        schemeId: schemeMeta.slug,
        schemeName: schemeMeta.scheme,
        amc: 'HDFC Mutual Fund',
        category: schemeMeta.category,
      };

      return {
        identity,
        holdings: domainHoldings,
        sectors,
        concentration: {
          top5Weight,
          top10Weight,
          totalHoldings: currentHoldings.length,
        },
        asOfDate: (currentData.metadata as Record<string, unknown>)?.asOf as string || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching scheme portfolio:', err);
      return null;
    }
  }

  public static async getPortfolioOverlap(schemeId1: string, schemeId2: string): Promise<PortfolioOverlapResult | null> {
    const portfolio1 = await this.getSchemePortfolio(schemeId1);
    const portfolio2 = await this.getSchemePortfolio(schemeId2);

    if (!portfolio1 || !portfolio2) return null;

    const holdings1Map = new Map(portfolio1.holdings.map(h => [h.isin || h.instrumentName, h]));
    const holdings2Map = new Map(portfolio2.holdings.map(h => [h.isin || h.instrumentName, h]));

    const commonHoldings: PortfolioOverlapResult['commonHoldings'] = [];
    const uniqueToScheme1: Holding[] = [];
    const uniqueToScheme2: Holding[] = [];

    let overlapWeightSum = 0;

    portfolio1.holdings.forEach(h1 => {
      const key = h1.isin || h1.instrumentName;
      const h2 = holdings2Map.get(key);

      if (h2) {
        const overlapWeight = Math.min(h1.weight, h2.weight);
        if (overlapWeight > 0) {
            overlapWeightSum += overlapWeight;
            commonHoldings.push({
            instrumentName: h1.instrumentName,
            isin: h1.isin,
            sector: h1.sector || 'Unclassified',
            weight1: h1.weight,
            weight2: h2.weight,
            overlapWeight,
            });
        }
      } else {
        if (h1.weight > 0) uniqueToScheme1.push(h1);
      }
    });

    portfolio2.holdings.forEach(h2 => {
      const key = h2.isin || h2.instrumentName;
      if (!holdings1Map.has(key) && h2.weight > 0) {
        uniqueToScheme2.push(h2);
      }
    });

    commonHoldings.sort((a, b) => b.overlapWeight - a.overlapWeight);
    uniqueToScheme1.sort((a, b) => b.weight - a.weight);
    uniqueToScheme2.sort((a, b) => b.weight - a.weight);

    // Sector overlap
    const sector1Map = new Map(portfolio1.sectors.map(s => [s.sector, s.weight]));
    const sector2Map = new Map(portfolio2.sectors.map(s => [s.sector, s.weight]));
    const allSectors = Array.from(new Set([...sector1Map.keys(), ...sector2Map.keys()]));
    const sectorOverlap = allSectors.map(sector => {
      const w1 = sector1Map.get(sector) || 0;
      const w2 = sector2Map.get(sector) || 0;
      return {
        sector,
        weight1: w1,
        weight2: w2,
        overlapWeight: Math.min(w1, w2)
      };
    }).filter(s => s.overlapWeight > 0).sort((a, b) => b.overlapWeight - a.overlapWeight);

    return {
      scheme1: portfolio1.identity,
      scheme2: portfolio2.identity,
      commonHoldings,
      uniqueToScheme1,
      uniqueToScheme2,
      metrics: {
        weightedOverlapPct: overlapWeightSum,
        commonHoldingsCount: commonHoldings.length,
        scheme1UniqueCount: uniqueToScheme1.length,
        scheme2UniqueCount: uniqueToScheme2.length,
      },
      sectorOverlap,
      concentrationDifferences: {
        top5WeightDiff: portfolio1.concentration.top5Weight - portfolio2.concentration.top5Weight,
        top10WeightDiff: portfolio1.concentration.top10Weight - portfolio2.concentration.top10Weight,
      }
    };
  }

  public static async getSecurityTimeline(slug: string) {
    try {
      const data = await fs.readFile(path.join(DATA_ROOT, 'securities', `${slug}.json`), 'utf8');
      const parsed = JSON.parse(data);
      return parsed; // Returns the full security timeline detail (as SecurityDetail)
    } catch {
      return null;
    }
  }

  private static async readMonthData(month: string): Promise<RawMonthData | null> {
    try {
      const data = await fs.readFile(path.join(DATA_ROOT, 'by-month', `${month}.json`), 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
