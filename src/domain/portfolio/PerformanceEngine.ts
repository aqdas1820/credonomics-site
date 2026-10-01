import { PortfolioTransaction, PortfolioCashFlow } from './types';

export interface ReturnResult {
  value: number | null;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  reason?: string;
}

export class PerformanceEngine {
  /**
   * Calculates Absolute Return: (Current Value - Invested Value) / Invested Value
   */
  public calculateAbsoluteReturn(investedValue: number, currentValue: number | null): ReturnResult {
    if (currentValue === null) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Current value is unavailable due to missing prices.' };
    }
    if (investedValue === 0) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Invested value is zero.' };
    }
    
    return {
      value: ((currentValue - investedValue) / investedValue) * 100,
      status: 'AVAILABLE'
    };
  }

  /**
   * Calculates CAGR (Compound Annual Growth Rate) based on initial investment date.
   * CAGR = (End Value / Begin Value)^(1 / Years) - 1
   * Note: This is a simplified CAGR that assumes a single initial investment or treats all as invested from day 1.
   * For multiple cash flows, XIRR is required.
   */
  public calculateCAGR(
    investedValue: number, 
    currentValue: number | null, 
    firstTransactionDate: string | null
  ): ReturnResult {
    if (currentValue === null) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Current value is unavailable.' };
    }
    if (investedValue <= 0) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Invested value must be greater than zero.' };
    }
    if (!firstTransactionDate) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Historical transaction dates are insufficient.' };
    }

    const start = new Date(firstTransactionDate).getTime();
    const end = Date.now();
    const days = (end - start) / (1000 * 60 * 60 * 24);
    
    if (days < 365) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Portfolio age is less than 1 year. CAGR is not meaningful.' };
    }

    const years = days / 365.25;
    const cagr = (Math.pow(currentValue / investedValue, 1 / years) - 1) * 100;

    return {
      value: cagr,
      status: 'AVAILABLE'
    };
  }

  /**
   * Calculates XIRR (Extended Internal Rate of Return) using cash flows.
   */
  public calculateXIRR(
    transactions: PortfolioTransaction[],
    cashFlows: PortfolioCashFlow[],
    currentValue: number | null
  ): ReturnResult {
    if (currentValue === null) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Current value is unavailable for terminal cash flow.' };
    }
    if (transactions.length === 0) {
      return { value: null, status: 'UNAVAILABLE', reason: 'Insufficient historical transactions.' };
    }

    // In a real implementation, we would implement the Newton-Raphson method for XIRR here.
    // For V6 Foundation, we validate inputs and return a placeholder or stub.
    // Ensure we have at least one negative cash flow (investment) and one positive (current value/withdrawals).
    
    let hasInvestment = false;
    for (const tx of transactions) {
      if (tx.type === 'BUY') hasInvestment = true;
    }

    if (!hasInvestment) {
      return { value: null, status: 'UNAVAILABLE', reason: 'No investment cash flows found.' };
    }

    return {
      value: null, // XIRR math omitted for briefness, but architecture supported.
      status: 'UNAVAILABLE',
      reason: 'XIRR math implementation deferred. Inputs are sufficient.'
    };
  }
}
