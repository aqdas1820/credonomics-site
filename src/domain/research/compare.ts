import type { MarketQuote, CorporateAction } from '../equity/types';
import type { CompanyFinancials } from '../equity/financial-intelligence';
import type { MFPortfolioData } from '../mf/types';
import { FinancialProvenance } from '../provenance';

export type CompareEntityType = 'stock' | 'mutual_fund';

export type BaseCompareEntity = {
  id: string;
  type: CompareEntityType;
  name: string;
  symbolOrCode: string;
  metadata: FinancialProvenance;
};

export type StockCompareEntity = BaseCompareEntity & {
  type: 'stock';
  sector: string | null;
  industry: string | null;
  quote: MarketQuote | null;
  financials: CompanyFinancials | null;
  actions: CorporateAction[] | null;
};

export type FundCompareEntity = BaseCompareEntity & {
  type: 'mutual_fund';
  amc: string | null;
  category: string | null;
  portfolio: MFPortfolioData | null;
};

export type CompareEntity = StockCompareEntity | FundCompareEntity;

export function isStockEntity(e: CompareEntity): e is StockCompareEntity {
  return e.type === 'stock';
}

export function isFundEntity(e: CompareEntity): e is FundCompareEntity {
  return e.type === 'mutual_fund';
}
