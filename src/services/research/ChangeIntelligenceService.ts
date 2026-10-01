import type { ChangeRecord, ChangeSignificance } from '../../domain/research/change-intelligence';
import type { MarketQuote, CorporateAction } from '../../domain/equity/types';
import type { CompanyFinancials } from '../../domain/equity/financial-intelligence';
import type { MFPortfolioData } from '../../domain/mf/types';
import { unknownDelivery } from '../../domain/provenance';

export class ChangeIntelligenceService {
  static getSignificance(pctChange: number | null): ChangeSignificance {
    if (pctChange === null) return 'unknown';
    const abs = Math.abs(pctChange);
    if (abs >= 10) return 'large';
    if (abs >= 3) return 'moderate';
    return 'small';
  }

  static generateStockChanges(
    entityId: string,
    quote: MarketQuote | null,
    financials: CompanyFinancials | null,
    actions: CorporateAction[] | null
  ): ChangeRecord[] {
    const changes: ChangeRecord[] = [];
    
    // 1. Financial Trends
    if (financials?.quarterly && financials.quarterly.length >= 2) {
      const latest = financials.quarterly[0];
      const previous = financials.quarterly[1];

      if (latest.revenue !== null && previous.revenue !== null && previous.revenue > 0) {
        const revChange = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
        changes.push({
          entityType: 'stock',
          entityId,
          category: 'financials',
          metric: 'Revenue',
          previousValue: previous.revenue,
          currentValue: latest.revenue,
          absoluteChange: latest.revenue - previous.revenue,
          percentageChange: revChange,
          previousPeriod: previous.period,
          currentPeriod: latest.period,
          eventDate: null,
          significance: this.getSignificance(revChange),
          metadata: financials as unknown as import("../../domain/provenance").FinancialProvenance
        });
      }

      if (latest.netProfit !== null && previous.netProfit !== null && previous.netProfit > 0) {
        const profitChange = ((latest.netProfit - previous.netProfit) / previous.netProfit) * 100;
        changes.push({
          entityType: 'stock',
          entityId,
          category: 'financials',
          metric: 'Net Profit',
          previousValue: previous.netProfit,
          currentValue: latest.netProfit,
          absoluteChange: latest.netProfit - previous.netProfit,
          percentageChange: profitChange,
          previousPeriod: previous.period,
          currentPeriod: latest.period,
          eventDate: null,
          significance: this.getSignificance(profitChange),
          metadata: financials as unknown as import("../../domain/provenance").FinancialProvenance
        });
      }
    }

    // 2. Shareholding Trends
    if (financials?.shareholding && financials.shareholding.length >= 2) {
      const latest = financials.shareholding[0];
      const previous = financials.shareholding[1];

      if (latest.fii !== null && previous.fii !== null) {
        const fiiChange = latest.fii - previous.fii;
        if (Math.abs(fiiChange) >= 0.5) {
          changes.push({
            entityType: 'stock',
            entityId,
            category: 'shareholding',
            metric: 'FII Holding',
            previousValue: previous.fii,
            currentValue: latest.fii,
            absoluteChange: fiiChange,
            percentageChange: fiiChange, // percentages for shareholding are already in %
            previousPeriod: previous.period,
            currentPeriod: latest.period,
            eventDate: null,
            significance: this.getSignificance(fiiChange),
            metadata: financials as unknown as import("../../domain/provenance").FinancialProvenance
          });
        }
      }
      
      if (latest.promoter !== null && previous.promoter !== null) {
        const promoterChange = latest.promoter - previous.promoter;
        if (Math.abs(promoterChange) >= 0.5) {
          changes.push({
            entityType: 'stock',
            entityId,
            category: 'shareholding',
            metric: 'Promoter Holding',
            previousValue: previous.promoter,
            currentValue: latest.promoter,
            absoluteChange: promoterChange,
            percentageChange: promoterChange,
            previousPeriod: previous.period,
            currentPeriod: latest.period,
            eventDate: null,
            significance: this.getSignificance(promoterChange),
            metadata: financials as unknown as import("../../domain/provenance").FinancialProvenance
          });
        }
      }
    }

    // 3. Corporate Actions
    if (actions && actions.length > 0) {
      // Find recent actions in the last 60 days
      const now = new Date().getTime();
      const recentActions = actions.filter(a => {
        const d = new Date(a.exDate || a.eventDate || a.announcementDate || '').getTime();
        if (Number.isNaN(d)) return false;
        const daysDiff = (now - d) / (1000 * 3600 * 24);
        return daysDiff > -30 && daysDiff < 60;
      });

      for (const a of recentActions) {
        changes.push({
          entityType: 'stock',
          entityId,
          category: 'corporate_action',
          metric: a.type,
          previousValue: null,
          currentValue: a.description,
          absoluteChange: null,
          percentageChange: null,
          previousPeriod: null,
          currentPeriod: a.reportingPeriod || null,
          eventDate: a.exDate || a.eventDate || a.announcementDate,
          significance: 'moderate',
          metadata: { ...unknownDelivery, fetchedAt: new Date().toISOString() } as unknown as import("../../domain/provenance").FinancialProvenance
        });
      }
    }

    // 4. Significant Price Move
    if (quote?.changePercent !== null && quote?.changePercent !== undefined) {
      if (Math.abs(quote.changePercent) > 5) {
        changes.push({
          entityType: 'stock',
          entityId,
          category: 'price',
          metric: 'Session Return',
          previousValue: quote.previousClose,
          currentValue: quote.price,
          absoluteChange: quote.change,
          percentageChange: quote.changePercent,
          previousPeriod: null,
          currentPeriod: null,
          eventDate: quote.timestamp,
          significance: this.getSignificance(quote.changePercent),
          metadata: quote as unknown as import("../../domain/provenance").FinancialProvenance
        });
      }
    }

    return changes;
  }

  static generateMutualFundChanges(
    entityId: string,
    portfolio: MFPortfolioData | null
  ): ChangeRecord[] {
    if (!portfolio || !portfolio.changeTimeline || portfolio.changeTimeline.length < 2) return [];
    const changes: ChangeRecord[] = [];

    const current = portfolio.changeTimeline[0];
    const prev = portfolio.changeTimeline[1];
    
    const newHoldingsDiff = current.newHoldings - prev.newHoldings;
    
    if (newHoldingsDiff !== 0) {
      changes.push({
        entityType: 'mutual_fund',
        entityId,
        category: 'portfolio_holding',
        metric: 'New Holdings Activity',
        previousValue: prev.newHoldings,
        currentValue: current.newHoldings,
        absoluteChange: newHoldingsDiff,
        percentageChange: null,
        previousPeriod: prev.month,
        currentPeriod: current.month,
        eventDate: null,
        significance: Math.abs(newHoldingsDiff) > 2 ? 'large' : 'moderate',
        metadata: { asOf: null, status: 'LIVE' } as unknown as import("../../domain/provenance").FinancialProvenance
      });
    }

    // Sort by absolute change magnitude
    changes.sort((a, b) => Math.abs(b.absoluteChange || 0) - Math.abs(a.absoluteChange || 0));

    return changes;
  }
}
