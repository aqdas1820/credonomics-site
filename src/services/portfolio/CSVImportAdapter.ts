import { ImportAdapter, NormalizationResult, ImportValidationResult, ImportValidationError, ImportValidationWarning } from '../../domain/portfolio/import';
import { PortfolioTransaction, PortfolioInstrument } from '../../domain/portfolio/types';

export class CSVImportAdapter implements ImportAdapter {
  name = 'Standard CSV Import';
  version = '1.0';

  async parse(rawContent: string): Promise<unknown[]> {
    // A simple CSV parser for demonstration
    // Real implementation should use papaparse or similar robust parser
    const lines = rawContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, index) => {
        row[h] = values[index];
      });
      rows.push(row);
    }
    
    return rows;
  }

  async normalize(parsedRows: unknown[], portfolioId: string): Promise<NormalizationResult> {
    const acceptedTransactions: PortfolioTransaction[] = [];
    const rejectedRows: unknown[] = [];
    const warnings: ImportValidationWarning[] = [];
    const errors: ImportValidationError[] = [];

    parsedRows.forEach((rawRow, index) => {
      try {
        const row = rawRow as Record<string, string>;
        const rowNumber = index + 2; // +1 for 0-index, +1 for header
        
        // Validate required fields
        if (!row.date || !row.symbol || !row.type || !row.quantity || !row.price) {
          rejectedRows.push(row);
          errors.push({ row: rowNumber, field: 'general', message: 'Missing required fields (date, symbol, type, quantity, price)' });
          return;
        }

        const qty = parseFloat(row.quantity);
        const price = parseFloat(row.price);

        if (isNaN(qty) || qty < 0) {
          rejectedRows.push(row);
          errors.push({ row: rowNumber, field: 'quantity', message: 'Invalid quantity' });
          return;
        }

        if (isNaN(price) || price < 0) {
          rejectedRows.push(row);
          errors.push({ row: rowNumber, field: 'price', message: 'Invalid price' });
          return;
        }

        const type = row.type.toUpperCase();
        const validTypes = ['BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT', 'RIGHTS', 'TRANSFER_IN', 'TRANSFER_OUT', 'FEE', 'TAX', 'OTHER'];
        
        if (!validTypes.includes(type)) {
          rejectedRows.push(row);
          errors.push({ row: rowNumber, field: 'type', message: `Unsupported transaction type: ${type}` });
          return;
        }

        const instrument: PortfolioInstrument = {
          instrumentKey: row.symbol.toUpperCase(),
          symbol: row.symbol.toUpperCase(),
          exchange: row.exchange ? row.exchange.toUpperCase() : 'NSE',
          isin: row.isin,
          name: row.name
        };

        const tx: PortfolioTransaction = {
          id: `tx_${Date.now()}_${index}`, // Mock ID generation
          portfolioId,
          date: new Date(row.date).toISOString(),
          type: type as PortfolioTransaction['type'],
          quantity: qty,
          price: price,
          grossAmount: qty * price,
          tax: 0,
          netAmount: (qty * price) + (row.fees ? parseFloat(row.fees) : 0),
          fees: row.fees ? parseFloat(row.fees) : 0,
          instrument,
          source: 'CSV_IMPORT'
        };

        acceptedTransactions.push(tx);
      } catch {
        rejectedRows.push(rawRow);
        errors.push({ row: index + 2, field: 'general', message: 'Failed to process row' });
      }
    });

    return {
      acceptedTransactions,
      rejectedRows,
      warnings,
      errors
    };
  }

  validate(): ImportValidationResult {
    const errors: ImportValidationError[] = [];
    const warnings: ImportValidationWarning[] = [];

    // Additional strict validation on normalized transactions
    // Example: Check for sells without buys (basic check, HoldingsEngine handles actual derivation)
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
