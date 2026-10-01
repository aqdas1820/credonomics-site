import { PortfolioTransaction } from './types';

export interface ImportValidationWarning {
  row: number;
  field: string;
  message: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface NormalizationResult {
  acceptedTransactions: PortfolioTransaction[];
  rejectedRows: unknown[]; // The raw unparseable rows
  warnings: ImportValidationWarning[];
  errors: ImportValidationError[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: ImportValidationError[];
  warnings: ImportValidationWarning[];
}

export interface ImportAdapter {
  name: string;
  version: string;
  
  /**
   * Parse the raw file content (e.g. CSV or JSON string) into an intermediate format.
   */
  parse(rawContent: string): Promise<unknown[]>;

  /**
   * Normalize the parsed rows into canonical PortfolioTransaction models.
   */
  normalize(parsedRows: unknown[], portfolioId: string): Promise<NormalizationResult>;
  
  /**
   * Run strict validation on the normalized transactions to detect issues before they are accepted.
   */
  validate(transactions: PortfolioTransaction[]): ImportValidationResult;
}
