import { getCompanyFinancialIntelligence } from '../market-data/company-financial-intelligence';
import { searchInstrumentMaster } from '../market-data/instrument-master';
import { SECTORS, SECTOR_CONSTITUENTS } from '../../../app/data/sectors';

export interface OwnershipChangeRecord {
  instrumentKey: string;
  symbol: string;
  companyName: string;
  category: 'Promoter' | 'FII' | 'DII';
  currentPercent: number;
  previousPercent: number;
  change: number;
  currentPeriod: string;
  previousPeriod: string;
  source: string;
}

export async function getOwnershipChanges(): Promise<OwnershipChangeRecord[]> {
  const universe = new Set<string>();
  for (const sector of SECTORS) {
     const symbols = SECTOR_CONSTITUENTS[sector.slug as keyof typeof SECTOR_CONSTITUENTS] || [];
     for (const symbol of symbols) {
        universe.add(symbol);
     }
  }

  const keys = new Set<string>();
  for (const symbol of universe) {
     const hit = searchInstrumentMaster(symbol, 1);
     if (hit && hit.length > 0) {
        keys.add(hit[0].instrumentKey);
     }
  }

  const results: OwnershipChangeRecord[] = [];
  const promises = Array.from(keys).map(async (key) => {
     try {
       const company = await getCompanyFinancialIntelligence(key);
       if (!company || !company.shareholding || company.shareholding.length < 2) return null;

       const current = company.shareholding[0];
       const previous = company.shareholding[1];

       const source = 'CredoNomics / Upstox API';
       
       if (current.promoter !== null && previous.promoter !== null && current.promoter !== previous.promoter) {
          results.push({
             instrumentKey: company.instrumentKey,
             symbol: company.symbol,
             companyName: company.companyName,
             category: 'Promoter',
             currentPercent: current.promoter,
             previousPercent: previous.promoter,
             change: current.promoter - previous.promoter,
             currentPeriod: current.period,
             previousPeriod: previous.period,
             source
          });
       }

       if (current.fii !== null && previous.fii !== null && current.fii !== previous.fii) {
          results.push({
             instrumentKey: company.instrumentKey,
             symbol: company.symbol,
             companyName: company.companyName,
             category: 'FII',
             currentPercent: current.fii,
             previousPercent: previous.fii,
             change: current.fii - previous.fii,
             currentPeriod: current.period,
             previousPeriod: previous.period,
             source
          });
       }

       if (current.dii !== null && previous.dii !== null && current.dii !== previous.dii) {
          results.push({
             instrumentKey: company.instrumentKey,
             symbol: company.symbol,
             companyName: company.companyName,
             category: 'DII',
             currentPercent: current.dii,
             previousPercent: previous.dii,
             change: current.dii - previous.dii,
             currentPeriod: current.period,
             previousPeriod: previous.period,
             source
          });
       }
     } catch {
       return null;
     }
  });

  await Promise.allSettled(promises);
  
  // Sort by largest absolute change
  results.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return results;
}
