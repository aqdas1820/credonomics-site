export interface SchemeIdentity {
  schemeId: string; // The canonical ID/slug (e.g., hdfc-large-and-mid-cap-fund)
  isin?: string;
  schemeCode?: string;
  schemeName: string;
  amc: string;
  category: string;
}

export type HoldingChangeStatus = "NEW" | "EXITED" | "INCREASED" | "DECREASED" | "UNCHANGED";

export interface Holding {
  instrumentName: string;
  isin?: string;
  instrumentType: "Equity" | "Debt" | "Cash" | "Other";
  weight: number;
  quantity?: number;
  valueInCr?: number;
  sector?: string;
  rating?: string;
  
  // V2 Quality & Provenance
  quality?: string;
  source?: string;
  sourceDocument?: string;
  sourceDate?: string;

  // V2 MoM Change Engine
  changeStatus?: HoldingChangeStatus;
  previousWeight?: number;
  weightChange?: number;

  // V2 Timeline
  timeline?: Array<{
    month: string;
    weight: number;
    weightChange: number;
    status: HoldingChangeStatus;
    sourceDocument?: string;
  }>;
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
  
  // V2 Timeline & Provenance
  changeTimeline?: Array<{
    month: string;
    holdingsCount: number;
    newHoldings: number;
    exitedHoldings: number;
  }>;
}

export interface PortfolioOverlapResult {
  scheme1: SchemeIdentity;
  scheme2: SchemeIdentity;
  commonHoldings: Array<{
    instrumentName: string;
    isin?: string;
    sector: string;
    weight1: number;
    weight2: number;
    overlapWeight: number; // min of both weights
  }>;
  uniqueToScheme1: Array<Holding>;
  uniqueToScheme2: Array<Holding>;
  metrics: {
    weightedOverlapPct: number;
    commonHoldingsCount: number;
    scheme1UniqueCount: number;
    scheme2UniqueCount: number;
  };
  sectorOverlap: Array<{
    sector: string;
    weight1: number;
    weight2: number;
    overlapWeight: number;
  }>;
  concentrationDifferences: {
    top5WeightDiff: number;
    top10WeightDiff: number;
  };
}
