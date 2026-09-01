import type { FinancialDataMetadata } from "../financial-data";

export type IpoRecord = FinancialDataMetadata & {
  slug: string;
  companyName: string;
  status: string;
  board?: "Mainboard" | "SME" | null;
  exchange?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  openDate?: string | null;
  closeDate?: string | null;
  listingDate?: string | null;
  prospectusUrl?: string | null;
};
