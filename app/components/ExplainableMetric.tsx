'use client'
import React, { useState } from 'react';

type ExplainableMetricProps = {
  value: React.ReactNode;
  provenance: {
    source?: string;
    period?: string;
    methodology?: string;
    calculationSteps?: string[];
  };
};

export default function ExplainableMetric({ value, provenance }: ExplainableMetricProps) {
  const [show, setShow] = useState(false);

  return (
    <span 
      style={{ position: 'relative', display: 'inline-block', cursor: 'help', borderBottom: '1px dotted #ccc' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {value}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          width: '240px',
          padding: '12px',
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '0.8rem',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textAlign: 'left',
          fontWeight: 'normal',
          lineHeight: '1.4'
        }}>
          {provenance.period && <div style={{ marginBottom: '4px' }}><strong>Period:</strong> {provenance.period}</div>}
          {provenance.source && <div style={{ marginBottom: '4px' }}><strong>Source:</strong> {provenance.source}</div>}
          {provenance.methodology && <div style={{ marginBottom: '4px' }}><strong>Methodology:</strong> {provenance.methodology}</div>}
          {provenance.calculationSteps && provenance.calculationSteps.length > 0 && (
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #333' }}>
              <strong>Calculation:</strong>
              <ul style={{ paddingLeft: '16px', margin: '4px 0 0' }}>
                {provenance.calculationSteps.map((step, idx) => <li key={idx}>{step}</li>)}
              </ul>
            </div>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            background: '#1a1a1a'
          }} />
        </div>
      )}
    </span>
  );
}
