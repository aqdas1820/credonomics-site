import React from 'react'
import type { MFPortfolioData } from '../../../../src/domain/mf/types'
import styles from '../../stocks/[exchange]/[symbol]/stock-detail.module.css'

export default function MFPortfolioUI({ data }: { data: MFPortfolioData }) {
  return (
    <>
      <section className={styles.chartCard} style={{ marginBottom: '24px' }}>
        <h2>Stock Concentration</h2>
        <div className={styles.brokerGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Top 5 Weight</span>
            <span className={styles.gridValue}>{data.concentration.top5Weight.toFixed(1)}%</span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Top 10 Weight</span>
            <span className={styles.gridValue}>{data.concentration.top10Weight.toFixed(1)}%</span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Total Holdings</span>
            <span className={styles.gridValue}>{data.concentration.totalHoldings}</span>
          </div>
        </div>
      </section>

      <div className={styles.brokerLayout} style={{ gridTemplateColumns: '2fr 1fr' }}>
        <section className={styles.chartCard}>
          <h2>Scheme Holdings</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>Instrument</th>
                  <th style={{ padding: '12px 8px' }}>Sector</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{h.instrumentName} <br/><small style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{h.instrumentType}</small></td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{h.sector || '—'}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{h.weight.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.statsCard}>
          <h2>Sector Overlaps</h2>
          <div className={styles.actionList}>
            {data.sectors.map(s => (
              <div key={s.sector} className={styles.actionItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{s.sector}</span>
                  <strong>{s.weight.toFixed(1)}%</strong>
                </div>
                {s.differenceToBenchmark !== undefined && (
                  <small style={{ color: s.differenceToBenchmark >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
                    {s.differenceToBenchmark >= 0 ? '+' : ''}{s.differenceToBenchmark.toFixed(1)}% vs benchmark
                  </small>
                )}
                <div style={{ width: '100%', height: '4px', background: 'var(--card-border)', borderRadius: '2px', marginTop: '4px' }}>
                  <div style={{ width: `${s.weight}%`, height: '100%', background: 'var(--brand-color)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
