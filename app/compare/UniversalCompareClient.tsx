'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './compare.module.css';
import { searchIndex, type SearchEntry } from '../data/search-index.generated';
import { searchEntries } from '../lib/search-utils';
import { useMarketData } from '../stocks/[exchange]/[symbol]/useMarketData';
import { useMFData } from '../mutual-funds/useMFData';
import { formatPercent, formatINR as formatMoney } from '../../src/lib/financial-format';
import { ChangeIntelligenceService } from '../../src/services/research/ChangeIntelligenceService';

type SelectedEntity = {
  id: string; // symbol or schemeId
  type: 'stock' | 'mutual_fund';
  title: string;
};

export default function UniversalCompareClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selected, setSelected] = useState<SelectedEntity[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      // Filter out only stocks and mutual funds
      const matches = searchEntries(searchIndex, query, 10).filter(
        e => e.category === 'Stocks' || e.category === 'Mutual Funds'
      );
      setResults(matches);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const addEntity = (entry: SearchEntry) => {
    const type = entry.category === 'Stocks' ? 'stock' : 'mutual_fund';
    let id = '';
    
    // Extract ID from href
    // stocks: /stocks/nse/reliance
    // mutual-funds: /mutual-funds/hdfc-flexi-cap-fund-e5787798
    if (type === 'stock') {
      const parts = entry.href.split('/');
      id = parts[parts.length - 1]; 
      // Actually useMarketData expects instrumentKey. In our system, usually instrumentKey format is BSE_EQ|INE... or NSE_EQ|INE... 
      // Wait, useMarketData uses instrumentKey. Where do we get it from search?
      // The search entry for stock usually has instrumentKey in description or similar? No, the URL is /stocks/exchange/symbol.
      // But the hook needs instrumentKey. Let's see how the stock page does it.
      // The stock page receives `stock = findInstrument(exchange, symbol)`. And passes `stock.instrumentKey`.
      // I'll need to fetch the stock identity. I can do this by hitting the /api/search with the symbol or just passing the symbol to a new wrapper.
    }
    
    // Fallback ID parsing for demo
    id = entry.href.split('/').pop() || '';
    
    if (!selected.find(s => s.id === id)) {
      setSelected([...selected, { id, type, title: entry.title }]);
    }
    setQuery('');
    setShowResults(false);
  };

  const removeEntity = (id: string) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const typeMismatch = selected.length > 1 && new Set(selected.map(s => s.type)).size > 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Universal Compare</h1>
        <p>Head-to-head factual comparison for Stocks and Mutual Funds.</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchWrap} ref={searchRef}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a company or mutual fund to add..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
          />
          {showResults && results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((r, i) => (
                <div key={i} className={styles.searchResultItem} onClick={() => addEntity(r)}>
                  <strong>{r.title}</strong>
                  <small>{r.category}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {typeMismatch && (
        <div className={styles.notice}>
          <strong>Warning:</strong> You are mixing stocks and mutual funds. Metrics will not align properly.
        </div>
      )}

      {selected.length === 0 ? (
        <div className={styles.emptyState}>
          Search and add entities to begin comparison.
        </div>
      ) : (
        <div className={styles.compareGrid}>
          {selected.map(entity => (
            <div key={entity.id} className={styles.entityColumn}>
              <div className={styles.entityHeader}>
                <div>
                  <h2>{entity.title}</h2>
                  <span>{entity.type === 'stock' ? 'Stock' : 'Mutual Fund'}</span>
                </div>
                <button className={styles.removeBtn} onClick={() => removeEntity(entity.id)}>Remove</button>
              </div>
              
              {entity.type === 'stock' ? (
                <StockCompareLoader symbol={entity.id} />
              ) : (
                <FundCompareLoader schemeId={entity.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockCompareLoader({ symbol }: { symbol: string }) {
  // Hack for demo: the useMarketData hook takes `instrumentKey`. 
  // Normally we would resolve the symbol to instrumentKey first.
  // For the sake of this iteration, we'll try to fetch it via a helper or assume it's NSE_EQ|symbol
  const [instrumentKey, setInstrumentKey] = useState<string | null>(null);
  
  useEffect(() => {
    // Resolve instrument key
    fetch(`/api/stocks/search?q=${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setInstrumentKey(data[0].instrumentKey);
        }
      });
  }, [symbol]);

  if (!instrumentKey) return <div className={styles.section}>Resolving identity...</div>;
  
  return <StockCompareData instrumentKey={instrumentKey} />;
}

function StockCompareData({ instrumentKey }: { instrumentKey: string }) {
  const { quote, shareholding, actions, financials } = useMarketData(instrumentKey);
  
  const changes = React.useMemo(() => {
    return ChangeIntelligenceService.generateStockChanges(
      instrumentKey,
      quote?.data ?? null,
      financials?.data ?? null,
      actions?.data ?? null
    );
  }, [instrumentKey, quote?.data, financials?.data, actions?.data]);

  return (
    <>
      <div className={styles.section}>
        <h3>Market & Valuation</h3>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Price</span>
          <span className={styles.metricValue}>{quote?.data?.price ? formatMoney(quote.data.price) : 'Unavailable'}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Market Cap</span>
          <span className={styles.metricValue}>{quote?.data?.marketCap !== undefined && quote?.data?.marketCap !== null ? `₹${quote.data.marketCap} Cr` : 'Unavailable'}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>P/E Ratio</span>
          <span className={styles.metricValue}>
            {financials?.data?.ratios.find(r => r.key === 'peRatio')?.value?.toFixed(2) ?? 'Unavailable'}
            <small>Period: {financials?.data?.reportingPeriod ?? 'Unknown'}</small>
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Business Performance</h3>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Revenue</span>
          <span className={styles.metricValue}>
            {financials?.data?.quarterly?.[0]?.revenue ? `₹${financials.data.quarterly[0].revenue} Cr` : 'Unavailable'}
          </span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Net Profit</span>
          <span className={styles.metricValue}>
            {financials?.data?.quarterly?.[0]?.netProfit ? `₹${financials.data.quarterly[0].netProfit} Cr` : 'Unavailable'}
          </span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>ROE</span>
          <span className={styles.metricValue}>
            {financials?.data?.ratios.find(r => r.key === 'roe')?.value ? formatPercent(financials.data.ratios.find(r => r.key === 'roe')!.value!) : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Ownership</h3>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Promoter</span>
          <span className={styles.metricValue}>
            {shareholding?.data?.promoterHolding !== undefined ? formatPercent(Number(shareholding.data.promoterHolding)) : 'Unavailable'}
            <small>As of {shareholding?.data?.asOf ?? 'Unknown'}</small>
          </span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>FII</span>
          <span className={styles.metricValue}>{shareholding?.data?.fiiHolding !== undefined ? formatPercent(Number(shareholding.data.fiiHolding)) : 'Unavailable'}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>DII</span>
          <span className={styles.metricValue}>{shareholding?.data?.diiHolding !== undefined ? formatPercent(Number(shareholding.data.diiHolding)) : 'Unavailable'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Recent Changes</h3>
        {changes.slice(0, 3).map((c, i) => (
          <div key={i} className={styles.metricRow}>
            <span className={styles.metricLabel}>{c.metric}</span>
            <span className={styles.metricValue}>
              {c.percentageChange ? formatPercent(Math.abs(c.percentageChange)) : c.currentValue} {c.percentageChange && c.percentageChange > 0 ? 'Inc' : c.percentageChange && c.percentageChange < 0 ? 'Dec' : ''}
              <small>{c.currentPeriod ? `vs ${c.previousPeriod}` : ''}</small>
            </span>
          </div>
        ))}
        {changes.length === 0 && <div className={styles.metricLabel}>No significant changes</div>}
      </div>
    </>
  );
}

function FundCompareLoader({ schemeId }: { schemeId: string }) {
  const { portfolio } = useMFData(schemeId);
  
  const changes = React.useMemo(() => {
    if (!portfolio?.data) return [];
    return ChangeIntelligenceService.generateMutualFundChanges(schemeId, portfolio.data);
  }, [schemeId, portfolio?.data]);

  return (
    <>
      <div className={styles.section}>
        <h3>Portfolio Identity</h3>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>AMC</span>
          <span className={styles.metricValue}>{portfolio?.data?.identity.amc ?? 'Unavailable'}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Category</span>
          <span className={styles.metricValue}>{portfolio?.data?.identity.category ?? 'Unavailable'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Concentration & Allocation</h3>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Holdings Count</span>
          <span className={styles.metricValue}>
            {portfolio?.data?.holdings.length ?? 'Unavailable'}
            <small>Period: {portfolio?.data?.asOfDate ?? 'Unknown'}</small>
          </span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Top 5 Concentration</span>
          <span className={styles.metricValue}>
            {portfolio?.data?.concentration.top5Weight ? formatPercent(portfolio.data.concentration.top5Weight) : 'Unavailable'}
          </span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Top 10 Concentration</span>
          <span className={styles.metricValue}>
            {portfolio?.data?.concentration.top10Weight ? formatPercent(portfolio.data.concentration.top10Weight) : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Top Holdings</h3>
        {portfolio?.data?.holdings.slice(0, 3).map((h, i) => (
          <div key={i} className={styles.metricRow}>
            <span className={styles.metricLabel}>{h.instrumentName}</span>
            <span className={styles.metricValue}>{formatPercent(h.weight)}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Portfolio Changes</h3>
        {changes.slice(0, 5).map((c, i) => (
          <div key={i} className={styles.metricRow}>
            <span className={styles.metricLabel} title={c.metric}>{c.metric.length > 20 ? c.metric.substring(0, 20) + '...' : c.metric}</span>
            <span className={styles.metricValue}>
              {c.percentageChange ? (c.percentageChange > 0 ? '+' : '') + c.percentageChange.toFixed(2) + '%' : c.currentValue}
              <small>{c.currentPeriod ? `vs ${c.previousPeriod}` : ''}</small>
            </span>
          </div>
        ))}
        {changes.length === 0 && <div className={styles.metricLabel}>No significant changes</div>}
      </div>
    </>
  );
}
