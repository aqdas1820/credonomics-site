'use client'
import React from 'react';
import Link from 'next/link';
import type { SectorModel } from '../../../src/domain/research/sector-intelligence';
import { formatINR, formatPercent } from '../../../src/lib/financial-format';
import DataFreshness from '../../components/DataFreshness';

export default function SectorClient({ data }: { data: SectorModel }) {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{data.sectorName} Sector Intelligence</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Tracking {data.constituentCount} major constituent companies.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <DataFreshness metadata={data} />
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #eaeaea', paddingBottom: '0.5rem' }}>Sector Snapshot</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Market Cap</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.aggregateMetrics.totalMarketCap ? formatINR(data.aggregateMetrics.totalMarketCap) : 'N/A'}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Median P/E</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.aggregateMetrics.medianPE ? `${data.aggregateMetrics.medianPE.toFixed(2)}x` : 'N/A'}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Median P/B</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.aggregateMetrics.medianPB ? `${data.aggregateMetrics.medianPB.toFixed(2)}x` : 'N/A'}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Median ROE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.aggregateMetrics.medianROE ? formatPercent(data.aggregateMetrics.medianROE) : 'N/A'}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #eaeaea', paddingBottom: '0.5rem' }}>Constituent Companies</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>Company</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>Market Cap</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>P/E</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>P/B</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>ROE</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>Revenue Growth (YoY)</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>Profit Growth (YoY)</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#333' }}>Reporting Period</th>
              </tr>
            </thead>
            <tbody>
              {data.constituents.sort((a,b) => (b.marketCap||0) - (a.marketCap||0)).map(c => (
                <tr key={c.instrumentKey} style={{ borderBottom: '1px solid #eaeaea' }} className="sector-tr">
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/stocks/nse/${c.symbol}`} style={{ color: '#0052cc', fontWeight: 500, textDecoration: 'none' }}>
                      {c.companyName}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem' }}>{c.marketCap ? formatINR(c.marketCap) : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{c.pe ? `${c.pe.toFixed(2)}x` : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{c.pb ? `${c.pb.toFixed(2)}x` : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{c.roe ? formatPercent(c.roe) : 'N/A'}</td>
                  <td style={{ padding: '1rem', color: c.revenueGrowth && c.revenueGrowth > 0 ? 'green' : (c.revenueGrowth && c.revenueGrowth < 0 ? 'red' : 'inherit') }}>
                    {c.revenueGrowth ? formatPercent(c.revenueGrowth) : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: c.profitGrowth && c.profitGrowth > 0 ? 'green' : (c.profitGrowth && c.profitGrowth < 0 ? 'red' : 'inherit') }}>
                    {c.profitGrowth ? formatPercent(c.profitGrowth) : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    {c.reportingPeriod ?? 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Values represent most recent reporting period available per company. 
          Do not assume cross-company reporting periods perfectly align.
        </p>
      </section>
    </main>
  );
}
