import type { FinancialDataMetadata } from "../financial-data";

export type MutualFundHolding = {
  securityId: string;
  isin?: string | null;
  stock: string;
  sector?: string | null;
  weight: number;
};

export type MutualFundSnapshot = FinancialDataMetadata & {
  amc: string;
  scheme: string;
  category?: string | null;
  month: string;
  holdings: MutualFundHolding[];
};
