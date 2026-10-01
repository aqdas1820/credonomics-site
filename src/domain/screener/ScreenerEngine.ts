import type { Operator, ScreenerQuery } from './types';
import type { CompanyFinancials } from '../equity/financial-intelligence';

export class ScreenerEngine {
  private evaluateCondition(value: number | string | boolean | null | undefined, operator: Operator, targetValue: number | string | boolean | number[] | null | undefined): boolean {
    if (operator === 'exists') return value !== null && value !== undefined;
    if (value === null || value === undefined) return false;
    if (targetValue === null || targetValue === undefined) return false;

    switch (operator) {
      case '>': return typeof value === 'number' && typeof targetValue === 'number' && value > targetValue;
      case '>=': return typeof value === 'number' && typeof targetValue === 'number' && value >= targetValue;
      case '<': return typeof value === 'number' && typeof targetValue === 'number' && value < targetValue;
      case '<=': return typeof value === 'number' && typeof targetValue === 'number' && value <= targetValue;
      case 'equals': return value === targetValue;
      case 'differs': return value !== targetValue;
      case 'between':
        if (Array.isArray(targetValue) && targetValue.length === 2 && typeof value === 'number') {
          return value >= targetValue[0] && value <= targetValue[1];
        }
        return false;
      default:
        return false;
    }
  }

  public evaluate(company: CompanyFinancials, query: ScreenerQuery): boolean {
    if (!query.filters || query.filters.length === 0) return true;

    for (const filter of query.filters) {
      let valueToCheck: number | string | boolean | null | undefined = null;

      // Map field names to their locations in CompanyFinancials
      if (filter.field === 'marketCap') valueToCheck = company.ratios.find(r => r.key === 'market_cap')?.value;
      else if (filter.field === 'pe') valueToCheck = company.ratios.find(r => r.key === 'pe_ratio')?.value;
      else if (filter.field === 'pb') valueToCheck = company.ratios.find(r => r.key === 'pb_ratio')?.value;
      else if (filter.field === 'roce') valueToCheck = company.ratios.find(r => r.key === 'roce')?.value;
      else if (filter.field === 'roe') valueToCheck = company.ratios.find(r => r.key === 'roe')?.value;
      else if (filter.field === 'debtToEquity') valueToCheck = company.ratios.find(r => r.key === 'debt_to_equity')?.value;
      
      else if (filter.field === 'revenueGrowthYoY') {
        const period = filter.periodSemantics === 'yoy_quarterly' ? company.quarterly?.[0] : company.annual?.[0];
        valueToCheck = period?.yoy ?? null;
      }
      else if (filter.field === 'profitGrowthYoY') {
        const period = filter.periodSemantics === 'yoy_quarterly' ? company.quarterly?.[0] : company.annual?.[0];
        if (period?.netProfit !== null && period?.netProfit !== undefined) {
           // We might need to compute YoY for profit if not pre-computed, but let's assume we can calculate it 
           // if we look back at the previous year's period
           // Actually `period.yoy` is revenue YoY. For net profit, let's look at historical records
           const currentIdx = 0;
           const history = filter.periodSemantics === 'yoy_quarterly' ? company.quarterly : company.annual;
           const offset = filter.periodSemantics === 'yoy_quarterly' ? 4 : 1;
           if (history && history.length > currentIdx + offset) {
             const currProfit = history[currentIdx].netProfit;
             const prevProfit = history[currentIdx + offset].netProfit;
             if (currProfit !== null && prevProfit !== null && prevProfit !== 0) {
               valueToCheck = ((currProfit - prevProfit) / Math.abs(prevProfit)) * 100;
             }
           }
        }
      }
      else if (filter.field === 'promoterHolding') valueToCheck = company.shareholding?.[0]?.promoter;
      else if (filter.field === 'fiiHolding') valueToCheck = company.shareholding?.[0]?.fii;
      else if (filter.field === 'diiHolding') valueToCheck = company.shareholding?.[0]?.dii;
      
      // Ownership Change Scanning
      else if (filter.field === 'promoterChange') {
         if (company.shareholding && company.shareholding.length > 1) {
            const curr = company.shareholding[0].promoter;
            const prev = company.shareholding[1].promoter;
            if (curr !== null && prev !== null) valueToCheck = curr - prev;
         }
      }
      else if (filter.field === 'fiiChange') {
         if (company.shareholding && company.shareholding.length > 1) {
            const curr = company.shareholding[0].fii;
            const prev = company.shareholding[1].fii;
            if (curr !== null && prev !== null) valueToCheck = curr - prev;
         }
      }
      else if (filter.field === 'diiChange') {
         if (company.shareholding && company.shareholding.length > 1) {
            const curr = company.shareholding[0].dii;
            const prev = company.shareholding[1].dii;
            if (curr !== null && prev !== null) valueToCheck = curr - prev;
         }
      }

      const passed = this.evaluateCondition(valueToCheck, filter.operator, filter.value);
      if (!passed) return false;
    }

    return true;
  }
}
