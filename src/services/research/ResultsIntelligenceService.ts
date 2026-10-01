import { getCompanyFinancialIntelligence } from '../market-data/company-financial-intelligence';
import { searchInstrumentMaster } from '../market-data/instrument-master';
import { SECTORS, SECTOR_CONSTITUENTS } from '../../../app/data/sectors';

export interface ResultRecord {
  instrumentKey: string;
  symbol: string;
  companyName: string;
  reportingPeriod: string | null;
  reportedDate: string | null;
  revenue: number | null;
  revenueYoY: number | null;
  profit: number | null;
  profitYoY: number | null;
  operatingMargin: number | null;
  source: string;
}

export async function getRecentResults(): Promise<ResultRecord[]> {
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

  const results: ResultRecord[] = [];
  const promises = Array.from(keys).map(async (key) => {
     try {
       const company = await getCompanyFinancialIntelligence(key);
       if (!company) return null;

       const latestQuarter = company.quarterly?.[0];
       if (!latestQuarter) return null;

       let profitYoY: number | null = null;
       if (company.quarterly && company.quarterly.length >= 5) {
          const currentProfit = company.quarterly[0].netProfit;
          const prevProfit = company.quarterly[4].netProfit;
          if (currentProfit !== null && prevProfit !== null && prevProfit !== 0) {
             profitYoY = ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100;
          }
       }

       results.push({
          instrumentKey: company.instrumentKey,
          symbol: company.symbol,
          companyName: company.companyName,
          reportingPeriod: company.reportingPeriod ?? null,
          // Upstox doesn't give us exact 'reportedDate', so we just show the period
          reportedDate: company.reportingPeriod || null, 
          revenue: latestQuarter.revenue ?? null,
          revenueYoY: latestQuarter.yoy ?? null,
          profit: latestQuarter.netProfit ?? null,
          profitYoY,
          operatingMargin: latestQuarter.operatingMargin ?? null,
          source: 'CredoNomics / Upstox API'
       });
     } catch {
       return null;
     }
  });

  await Promise.allSettled(promises);
  
  // Sort by some logic, maybe alphabetical since we don't have exact dates
  results.sort((a, b) => a.companyName.localeCompare(b.companyName));

  return results;
}
