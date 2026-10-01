import { FinancialProvenance } from '../provenance';

export type ChangeSignificance = 'large' | 'moderate' | 'small' | 'unknown';

export type ChangeRecord = {
  entityType: 'stock' | 'mutual_fund';
  entityId: string;
  category: string; // e.g., 'financials', 'shareholding', 'corporate_action', 'portfolio_holding', 'concentration'
  metric: string; // e.g., 'QoQ Revenue', 'FII Holding', 'Dividend', 'HDFC Bank Ltd'
  previousValue: string | number | null;
  currentValue: string | number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  previousPeriod: string | null;
  currentPeriod: string | null;
  eventDate: string | null;
  significance: ChangeSignificance;
  metadata: FinancialProvenance;
};
