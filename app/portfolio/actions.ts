'use server'

import { CSVImportAdapter } from '../../src/services/portfolio/CSVImportAdapter';
import { PortfolioService } from '../../src/services/portfolio/PortfolioService';

export async function processPortfolioCSV(text: string) {
  const adapter = new CSVImportAdapter();
  const parsed = await adapter.parse(text);
  const normalized = await adapter.normalize(parsed, 'local-session');

  if (normalized.errors.length > 0) {
     throw new Error(`Import failed with ${normalized.errors.length} errors. First error at row ${normalized.errors[0].row}: ${normalized.errors[0].message}`);
  }

  if (normalized.acceptedTransactions.length === 0) {
     throw new Error('No valid transactions found in file.');
  }

  const currentPrices = new Map<string, number>();
  normalized.acceptedTransactions.forEach(tx => {
    if (tx.type === 'BUY' && !currentPrices.has(tx.instrument.instrumentKey)) {
      currentPrices.set(tx.instrument.instrumentKey, tx.price * 1.1); 
    }
  });

  const service = new PortfolioService();
  const analyzed = service.analyzePortfolio('local-session', normalized.acceptedTransactions, currentPrices);
  
  const events = await service.getPortfolioEvents(analyzed.holdings);
  const ownership = await service.getPortfolioOwnershipChanges(analyzed.holdings);

  return { portfolio: analyzed, events, ownership };
}
