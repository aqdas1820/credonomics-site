import { describe, it, expect } from 'vitest';
import { CSVImportAdapter } from '../../src/services/portfolio/CSVImportAdapter';

describe('CSVImportAdapter', () => {
  it('parses and normalizes valid rows', async () => {
    const adapter = new CSVImportAdapter();
    const csv = `date,symbol,type,quantity,price,exchange
2023-01-01,TCS,BUY,10,100,NSE
2023-01-10,INFY,BUY,20,200,BSE`;

    const parsed = await adapter.parse(csv);
    expect(parsed.length).toBe(2);

    const result = await adapter.normalize(parsed, 'p1');
    expect(result.acceptedTransactions.length).toBe(2);
    expect(result.rejectedRows.length).toBe(0);
    
    expect(result.acceptedTransactions[0].instrument.instrumentKey).toBe('TCS');
    expect(result.acceptedTransactions[0].instrument.exchange).toBe('NSE');
    expect(result.acceptedTransactions[1].instrument.exchange).toBe('BSE');
  });

  it('rejects invalid rows', async () => {
    const adapter = new CSVImportAdapter();
    const csv = `date,symbol,type,quantity,price
2023-01-01,TCS,BUY,invalid,100
2023-01-10,INFY,INVALID_TYPE,20,200
,MISSING_DATE,BUY,10,100`;

    const parsed = await adapter.parse(csv);
    const result = await adapter.normalize(parsed, 'p1');

    expect(result.acceptedTransactions.length).toBe(0);
    expect(result.rejectedRows.length).toBe(3);
    expect(result.errors.length).toBe(3);
  });
});
