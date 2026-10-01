'use client'
import React, { useState } from 'react'
import type { DetailedFinancialPeriod } from '../../../../src/domain/research/historical-intelligence'
import { HistoricalTrendEngine } from '../../../../src/domain/research/historical-intelligence'
import styles from './financial-intelligence.module.css'
import { formatINR, formatPercent } from '../../../../src/lib/financial-format'
import ExplainableMetric from '../../../components/ExplainableMetric'

function HistoricalTrendTable({ periods, isBank }: { periods: DetailedFinancialPeriod[], isBank: boolean }) {
  if (!periods || periods.length === 0) return null;

  const columns = [
    { key: 'revenue', label: 'Revenue' },
    ...(!isBank ? [{ key: 'operatingProfit', label: 'Op Profit' }, { key: 'operatingMargin', label: 'Op Margin %', percent: true }] : []),
    { key: 'netProfit', label: 'Net Profit' },
    { key: 'eps', label: 'EPS' },
    ...(!isBank ? [{ key: 'totalDebt', label: 'Debt' }] : []),
    { key: 'roe', label: 'ROE %', percent: true }
  ];

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Period</th>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.slice(0, 8).map(period => (
            <tr key={period.periodLabel}>
              <th>{period.periodLabel}</th>
              {columns.map(col => {
                const val = period[col.key as keyof DetailedFinancialPeriod] as number | null;
                return (
                  <td key={col.key} className={val !== null && val < 0 ? styles.negative : ''}>
                    {val === null ? 'N/A' : col.percent ? formatPercent(val) : formatINR(val)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary, #666)' }}>
        <p>Source: {periods[0].source} · Data Quality: {periods[0].availability}</p>
      </div>
    </div>
  )
}

function HistoricalCharts({ periods, isBank }: { periods: DetailedFinancialPeriod[], isBank: boolean }) {
  const chartLabels = (['revenue', ...(!isBank ? ['operatingProfit'] : []), 'netProfit'] as Array<keyof DetailedFinancialPeriod>)
    .filter(label => periods.some(p => p[label] !== null));

  return (
    <div className={styles.charts}>
      {chartLabels.map(label => {
        const values = periods.map(p => p[label] as number | null).filter((x): x is number => x !== null);
        const max = Math.max(...values.map(Math.abs), 1);
        
        return (
          <article key={label}>
            <h3>{label.replace(/([A-Z])/g, ' $1').replace(/^./, x => x.toUpperCase())}</h3>
            <div className={styles.chart}>
              {periods.filter(p => p[label] !== null).slice(0, 8).reverse().map(point => {
                const value = point[label] as number;
                return (
                  <div key={point.periodLabel} className={styles.barItem}>
                    <span 
                      className={value < 0 ? styles.negativeBar : ''} 
                      title={`${point.periodLabel}: ${formatINR(value)}`} 
                      style={{ height: `${Math.max(5, (Math.abs(value) / max) * 100)}%` }} 
                    />
                    <small>{point.periodLabel}</small>
                  </div>
                );
              })}
            </div>
          </article>
        )
      })}
    </div>
  );
}

export default function HistoricalTrends({
  quarterly,
  annual,
  isBank
}: {
  quarterly: DetailedFinancialPeriod[] | undefined,
  annual: DetailedFinancialPeriod[] | undefined,
  isBank: boolean
}) {
  const [frequency, setFrequency] = useState<'quarterly' | 'annual'>('quarterly');
  const points = frequency === 'quarterly' ? quarterly : annual;

  if (!points || points.length === 0) return null;

  return (
    <section className={styles.section} id="historical-trends">
      <header>
        <div>
          <span>Verified factual history</span>
          <h2>Historical Financial Intelligence</h2>
        </div>
        <div className={styles.switch}>
          {quarterly && quarterly.length > 0 && <button className={frequency === 'quarterly' ? styles.active : ''} onClick={() => setFrequency('quarterly')}>Quarterly</button>}
          {annual && annual.length > 0 && <button className={frequency === 'annual' ? styles.active : ''} onClick={() => setFrequency('annual')}>Annual</button>}
        </div>
      </header>
      
      <HistoricalCharts periods={points} isBank={isBank} />
      <HistoricalTrendTable periods={points} isBank={isBank} />
      
      {points.length >= 2 && (
        <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary, #fafafa)', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Latest {frequency === 'quarterly' ? 'QoQ / YoY' : 'YoY'} Trends</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {HistoricalTrendEngine.buildTrendList(points[0], points[1]).map(trend => (
              <div key={trend.metric} style={{ borderLeft: `3px solid ${trend.percentageChange && trend.percentageChange > 0 ? 'var(--color-positive, green)' : trend.percentageChange && trend.percentageChange < 0 ? 'var(--color-negative, red)' : '#ccc'}`, paddingLeft: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{trend.metric} ({trend.calculationMethod})</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  <ExplainableMetric 
                    value={<>{trend.percentageChange !== null ? formatPercent(Math.abs(trend.percentageChange)) : 'N/A'} {trend.percentageChange && trend.percentageChange > 0 ? 'Up' : trend.percentageChange && trend.percentageChange < 0 ? 'Down' : ''}</>}
                    provenance={{
                      methodology: trend.calculationMethod,
                      period: `${trend.currentPeriod} vs ${trend.previousPeriod}`,
                      calculationSteps: [
                        `Current: ${trend.unit === 'percent' ? (trend.currentValue ? formatPercent(trend.currentValue) : 'N/A') : (trend.currentValue ? formatINR(trend.currentValue) : 'N/A')}`,
                        `Previous: ${trend.unit === 'percent' ? (trend.previousValue ? formatPercent(trend.previousValue) : 'N/A') : (trend.previousValue ? formatINR(trend.previousValue) : 'N/A')}`,
                        `Absolute Diff: ${trend.unit === 'percent' ? (trend.absoluteChange ? formatPercent(trend.absoluteChange) : 'N/A') : (trend.absoluteChange ? formatINR(trend.absoluteChange) : 'N/A')}`
                      ]
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>{trend.currentPeriod} vs {trend.previousPeriod}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
