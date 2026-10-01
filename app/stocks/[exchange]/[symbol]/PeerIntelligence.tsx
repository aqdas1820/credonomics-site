'use client'
import React from 'react'
import type { PeerMetric } from '../../../../src/domain/equity/financial-intelligence'
import styles from './financial-intelligence.module.css'
import { formatINR, formatPercent } from '../../../../src/lib/financial-format'

export default function PeerIntelligence({ peers }: { peers: PeerMetric[] }) {
  if (!peers || peers.length <= 1) return null;

  return (
    <section className={styles.section} id="peers">
      <header>
        <div>
          <span>Official competitor classification</span>
          <h2>Peer Comparison</h2>
        </div>
      </header>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Sector / Industry</th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th>P/B</th>
              <th>EV/EBITDA</th>
              <th>ROE</th>
              <th>ROCE</th>
              <th>Op Margin</th>
              <th>Debt / Eq</th>
              <th>Reporting Period</th>
            </tr>
          </thead>
          <tbody>
            {peers.map(peer => {
              const get = (match: RegExp) => peer.ratios.find(x => match.test(x.label))?.value ?? null;
              
              const mcap = get(/market cap/i);
              const pe = get(/^P\/E$/i);
              const pb = get(/^P\/B$/i);
              const evEbitda = get(/EV\/EBITDA/i);
              const roe = get(/^ROE$/i);
              const roce = get(/^ROCE$/i);
              const opMargin = get(/operating profit margin/i) ?? get(/op margin/i);
              const debtEq = get(/debt.*equity/i);
              
              return (
                <tr className={peer.current ? styles.current : ''} key={peer.instrumentKey}>
                  <th>
                    {peer.companyName ?? peer.symbol ?? peer.instrumentKey}
                    {peer.current && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'var(--accent, #0052cc)', color: '#fff', padding: '2px 4px', borderRadius: '4px' }}>CURRENT</span>}
                  </th>
                  <td>
                    {peer.sector ?? 'N/A'}
                    {peer.industry && <div style={{ fontSize: '0.75rem', color: '#666' }}>{peer.industry}</div>}
                  </td>
                  <td>{mcap !== null ? formatINR(mcap) : 'N/A'}</td>
                  <td>{pe !== null ? `${pe.toFixed(2)}x` : 'N/A'}</td>
                  <td>{pb !== null ? `${pb.toFixed(2)}x` : 'N/A'}</td>
                  <td>{evEbitda !== null ? `${evEbitda.toFixed(2)}x` : 'N/A'}</td>
                  <td>{roe !== null ? formatPercent(roe) : 'N/A'}</td>
                  <td>{roce !== null ? formatPercent(roce) : 'N/A'}</td>
                  <td>{opMargin !== null ? formatPercent(opMargin) : 'N/A'}</td>
                  <td>{debtEq !== null ? debtEq.toFixed(2) : 'N/A'}</td>
                  <td style={{ color: peer.reportingPeriod ? 'inherit' : 'var(--color-warning, #d97706)' }}>
                    {peer.reportingPeriod ?? 'Period Unknown'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.disclaimer}>
        Peer data is factual and is not an investment recommendation. 
        Comparing companies with mismatched reporting periods may lead to inaccurate conclusions.
      </p>
    </section>
  )
}
