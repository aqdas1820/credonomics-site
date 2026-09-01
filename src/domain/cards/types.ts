import type { FinancialDataMetadata } from "../financial-data";

export type CardResearchRecord = FinancialDataMetadata & {
  id: string;
  issuer: string;
  name: string;
  annualFee: number | null;
  joiningFee: number | null;
};
