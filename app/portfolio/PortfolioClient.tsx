'use client';

import React, { useState } from 'react';
import styles from './portfolio.module.css';
import { Portfolio } from '../../src/domain/portfolio/types';
import Link from 'next/link';
import { processPortfolioCSV } from './actions';

export default function PortfolioClient() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [events, setEvents] = useState<unknown>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const result = await processPortfolioCSV(text);
      
      setPortfolio(result.portfolio);
      setEvents({ events: result.events, ownership: result.ownership });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to process import.');
      } else {
        setError('Failed to process import.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (!portfolio) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>Your Portfolio Workspace</h2>
        <p className={styles.emptyDesc}>
          Upload a CSV of your transactions to analyze your portfolio. 
          No data is stored on our servers — analysis runs entirely in your local session.
        </p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6 text-left max-w-lg mx-auto">
            <strong>Import Error:</strong> {error}
          </div>
        )}

        <label className={styles.importButton}>
          {isImporting ? 'Processing...' : 'Import CSV'}
          <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} disabled={isImporting} />
        </label>
        
        <div className="mt-8 text-sm text-gray-500 text-left max-w-lg mx-auto bg-gray-900 p-4 rounded">
          <strong>Expected CSV Format:</strong>
          <pre className="mt-2 text-xs overflow-x-auto text-gray-400">
            date,symbol,type,quantity,price,exchange{'\n'}
            2023-01-01,RELIANCE,BUY,10,2500,NSE{'\n'}
            2023-02-15,TCS,BUY,5,3000,NSE
          </pre>
        </div>
      </div>
    );
  }

  const totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalCurrent = portfolio.holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const unrealizedPnL = totalCurrent - totalInvested;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Current Value</div>
          <div className={styles.cardValue}>{formatCurrency(totalCurrent)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Invested Value</div>
          <div className={styles.cardValue}>{formatCurrency(totalInvested)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Unrealized P&L</div>
          <div className={`${styles.cardValue} ${unrealizedPnL >= 0 ? styles.positive : styles.negative}`}>
            {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
          </div>
          <div className={styles.cardSub}>
             {totalInvested > 0 ? ((unrealizedPnL / totalInvested) * 100).toFixed(2) : 0}%
          </div>
        </div>
      </section>

      {/* Holdings Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">Holdings ({portfolio.holdings.length})</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Avg Cost</th>
                <th className="text-right">Invested</th>
                <th className="text-right">CMP</th>
                <th className="text-right">Current Value</th>
                <th className="text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map(h => {
                const pnl = h.unrealizedPnL || 0;
                return (
                  <tr key={h.instrument.instrumentKey}>
                    <td>
                      <Link href={`/stocks/${h.instrument.exchange.toLowerCase()}/${h.instrument.symbol.toLowerCase()}`} className="font-bold text-blue-400 hover:underline">
                        {h.instrument.symbol}
                      </Link>
                    </td>
                    <td className="text-right">{h.quantity}</td>
                    <td className="text-right">{formatCurrency(h.averageCost)}</td>
                    <td className="text-right">{formatCurrency(h.investedValue)}</td>
                    <td className="text-right">{formatCurrency(h.currentPrice)}</td>
                    <td className="text-right font-semibold">{formatCurrency(h.currentValue)}</td>
                    <td className={`text-right font-medium ${pnl >= 0 ? styles.positive : styles.negative}`}>
                      {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                      <div className="text-xs opacity-70">
                        {h.unrealizedPnLPercent !== null ? h.unrealizedPnLPercent.toFixed(2) + '%' : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className={styles.card}>
          <h2 className="text-lg font-bold mb-4">Data Coverage</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex justify-between">
              <span>Transaction History</span>
              <span className="text-green-400">{portfolio.coverage.transactionCoverage}</span>
            </li>
            <li className="flex justify-between">
              <span>Price Coverage</span>
              <span className="text-green-400">{portfolio.coverage.priceCoverage}</span>
            </li>
            <li className="flex justify-between">
              <span>Instrument Mapping</span>
              <span className="text-green-400">{portfolio.coverage.instrumentMapping}</span>
            </li>
          </ul>
        </section>

        <section className={styles.card}>
          <h2 className="text-lg font-bold mb-4">Recent Events</h2>
          <p className="text-sm text-gray-400 mb-4">Integrates with CredoNomics Event Intelligence</p>
          {events ? (
            <div className="text-gray-500 text-sm italic">
              Events loaded successfully. (UI integration pending)
            </div>
          ) : (
            <div className="text-gray-500 text-sm italic">
              No upcoming events found for current holdings.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
