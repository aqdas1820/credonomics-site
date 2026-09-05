export interface SchemeIdentity {
  isin: string;
  schemeName: string;
  amc: string;
  category: string;
}

export interface Holding {
  instrumentName: string;
  instrumentType: "Equity" | "Debt" | "Cash" | "Other";
  weight: number;
  valueInCr?: number;
  sector?: string;
  rating?: string;
}

export interface SectorOverlap {
  sector: string;
  weight: number;
  differenceToBenchmark?: number;
}

export interface StockConcentration {
  top5Weight: number;
  top10Weight: number;
  totalHoldings: number;
}

export interface MFPortfolioData {
  identity: SchemeIdentity;
  holdings: Holding[];
  sectors: SectorOverlap[];
  concentration: StockConcentration;
  asOfDate: string;
}
