import React from 'react';
import type { ChangeRecord } from '../../src/domain/research/change-intelligence';
import type { CorporateAction, MarketQuote } from '../../src/domain/equity/types';
import type { CompanyFinancials } from '../../src/domain/equity/financial-intelligence';
import type { MFPortfolioData } from '../../src/domain/mf/types';
import { formatPercent, formatINR as formatMoney } from '../../src/lib/financial-format';
import styles from './research-snapshot.module.css';
import DataFreshness from './DataFreshness';

type StockProps = {
  type: 'stock';
  quote: MarketQuote | null;
  financials: CompanyFinancials | null;
  actions: CorporateAction[] | null;
  changes: ChangeRecord[];
};

type FundProps = {
  type: 'mutual_fund';
  portfolio: MFPortfolioData | null;
  changes: ChangeRecord[];
};

type Props = StockProps | FundProps;

export default function ResearchSnapshot(props: Props) {
  const risks: string[] = [];
  const monitoring: string[] = [];
  
  let currentStateNode = null;
  let metadata = null;
  
  if (props.type === 'stock') {
    const { quote, financials, actions } = props;
    metadata = financials as unknown as import('../../src/domain/provenance').FinancialProvenance;
    
    // CURRENT STATE
    currentStateNode = (
      <div className={styles.stateGrid}>
        <div>
          <small>Current Price</small>
          <strong>{quote ? formatMoney(quote.price) : 'Unavailable'}</strong>
        </div>
        <div>
          <small>Market Cap</small>
          <strong>{quote?.marketCap !== undefined && quote?.marketCap !== null ? `₹${quote.marketCap} Cr` : 'Unavailable'}</strong>
        </div>
        <div>
          <small>Latest Quarter</small>
          <strong>{financials?.reportingPeriod ?? 'Unknown'}</strong>
        </div>
        <div>
          <small>Revenue</small>
          <strong>{financials?.quarterly?.[0]?.revenue ? `₹${financials.quarterly[0].revenue} Cr` : 'Unavailable'}</strong>
        </div>
      </div>
    );

    // RISKS
    if (financials?.summary.totalDebt && quote?.marketCap && financials.summary.totalDebt > quote.marketCap) {
      risks.push("Debt exceeds current market capitalization.");
    }
    if (financials?.ratios) {
      const margin = financials.ratios.find(r => r.key === 'operatingMargin')?.value;
      if (margin !== undefined && margin !== null && margin < 0) {
        risks.push("Operating margin is currently negative.");
      }
    }
    if (financials && (financials as unknown as { status: string }).status === 'STALE') {
      risks.push("Financial data is marked as stale or missing recent filings.");
    }
    
    // MONITORING
    if (actions && actions.length > 0) {
      const upcoming = actions.find(a => new Date(a.exDate || a.eventDate || '') > new Date());
      if (upcoming) {
        monitoring.push(`Upcoming ${upcoming.type} on ${upcoming.exDate || upcoming.eventDate}`);
      }
    }
    monitoring.push("Next quarterly result period.");
  } else {
    const { portfolio } = props;
    // no metadata on MF portfolio data
    
    // CURRENT STATE
    currentStateNode = (
      <div className={styles.stateGrid}>
        <div>
          <small>Portfolio Month</small>
          <strong>{portfolio?.asOfDate ?? 'Unknown'}</strong>
        </div>
        <div>
          <small>Holdings Count</small>
          <strong>{portfolio?.holdings.length ?? 'Unavailable'}</strong>
        </div>
        <div>
          <small>Top 10 Concentration</small>
          <strong>{portfolio?.concentration.top10Weight ? formatPercent(portfolio.concentration.top10Weight) : 'Unavailable'}</strong>
        </div>
      </div>
    );
    
    // RISKS
    if (portfolio?.concentration.top5Weight && portfolio.concentration.top5Weight > 40) {
      risks.push(`High portfolio concentration (Top 5: ${formatPercent(portfolio.concentration.top5Weight)})`);
    }
    // Cannot check STALE since metadata is not on MFPortfolioData but we will just omit it
    if (portfolio?.concentration.top10Weight && portfolio.concentration.top10Weight > 60) {
      risks.push("Top 10 holdings exceed 60% of portfolio.");
    }
    
    // MONITORING
    monitoring.push("Next monthly portfolio disclosure.");
  }
  
  return (
    <section className={styles.snapshot}>
      <header className={styles.header}>
        <h2>Research Snapshot</h2>
        {metadata && <DataFreshness metadata={metadata} />}
      </header>
      
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Current State</h3>
          {currentStateNode}
        </div>
        
        <div className={styles.card}>
          <h3>Recent Changes</h3>
          {props.changes.length > 0 ? (
            <ul className={styles.list}>
              {props.changes.slice(0, 4).map((c, i) => (
                <li key={i}>
                  <strong>{c.metric}:</strong> {c.percentageChange ? formatPercent(Math.abs(c.percentageChange)) : c.currentValue} {c.percentageChange && c.percentageChange > 0 ? 'increase' : c.percentageChange && c.percentageChange < 0 ? 'decrease' : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No material changes detected recently.</p>
          )}
        </div>
        
        {props.type === 'stock' && props.actions && props.actions.length > 0 && (
          <div className={styles.card}>
            <h3>Important Events</h3>
            <ul className={styles.list}>
              {props.actions.slice(0, 3).map((a, i) => (
                <li key={i}>{a.type}: {a.description} ({a.exDate || a.eventDate})</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className={styles.card}>
          <h3>Key Factual Risks</h3>
          {risks.length > 0 ? (
            <ul className={styles.list}>
              {risks.map((r, i) => (
                <li key={i} className={styles.riskItem}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No explicit factual risks flagged based on current data constraints.</p>
          )}
        </div>

        <div className={styles.card}>
          <h3>What to Monitor</h3>
          {monitoring.length > 0 ? (
            <ul className={styles.list}>
              {monitoring.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No specific imminent events.</p>
          )}
        </div>
      </div>
    </section>
  );
}
