'use client'
import React from 'react'
import type { DetailedFinancialPeriod } from '../../../../src/domain/research/historical-intelligence'
import styles from './financial-intelligence.module.css'
import { formatPercent } from '../../../../src/lib/financial-format'

export default function BusinessQuality({ quarterly, annual }: { quarterly?: DetailedFinancialPeriod[], annual?: DetailedFinancialPeriod[] }) {
  const points = annual && annual.length > 0 ? annual : (quarterly && quarterly.length > 0 ? quarterly : []);
  if (!points || points.length < 3) return null; // Need at least 3 periods to show trend

  const latest = points[0];
  const mid = points[1];
  const oldest = points[2];

  const getDir = (v1: number | null, v2: number | null) => {
    if (v1 === null || v2 === null) return null;
    return v1 > v2 ? 'Up' : v1 < v2 ? 'Down' : 'Flat';
  }

  const renderTrend = (label: string, key: keyof DetailedFinancialPeriod, isPercent = false) => {
    const v1 = oldest[key] as number | null;
    const v2 = mid[key] as number | null;
    const v3 = latest[key] as number | null;

    const trendText = [v1, v2, v3].filter(v => v !== null).length === 3
      ? `${getDir(v2, v1)} → ${getDir(v3, v2)}`
      : 'N/A';

    return (
      <div style={{ padding: '1rem', border: '1px solid #eaeaea', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trendText}</div>
        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
          {v1 !== null ? (isPercent ? formatPercent(v1) : v1.toFixed(1)) : 'N/A'} → {v3 !== null ? (isPercent ? formatPercent(v3) : v3.toFixed(1)) : 'N/A'}
        </div>
      </div>
    );
  }

  return (
    <section className={styles.section} id="business-quality">
      <header>
        <div>
          <span>Measurable factual characteristics</span>
          <h2>Business Quality Facts</h2>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {renderTrend('Revenue Trend', 'revenue')}
        {renderTrend('Operating Margin', 'operatingMargin', true)}
        {renderTrend('Net Profit Trend', 'netProfit')}
        {renderTrend('Total Debt', 'totalDebt')}
        {renderTrend('ROE Consistency', 'roe', true)}
      </div>
      <p className={styles.disclaimer} style={{ marginTop: '1rem' }}>
        These are factual, measurable observations of the business history, not investment recommendations.
      </p>
    </section>
  )
}
