import type { FinancialDataMetadata } from '../financial-data'

export interface SectorConstituent {
  instrumentKey: string;
  symbol: string;
  companyName: string;
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  reportingPeriod: string | null;
}

export interface SectorModel extends FinancialDataMetadata {
  sectorName: string;
  slug: string;
  constituentCount: number;
  aggregateMetrics: {
    medianPE: number | null;
    medianPB: number | null;
    medianROE: number | null;
    totalMarketCap: number | null;
  };
  constituents: SectorConstituent[];
}
