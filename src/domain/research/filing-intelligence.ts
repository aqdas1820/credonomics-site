export type DocumentType = 
  | 'financial_results' 
  | 'annual_report' 
  | 'investor_presentation' 
  | 'shareholding_pattern' 
  | 'corporate_announcement' 
  | 'board_meeting_outcome' 
  | 'dividend_announcement' 
  | 'bonus_split_rights_buyback' 
  | 'other_exchange_filing'
  | 'unknown';

export interface CompanyFiling {
  documentId: string;
  companyId: string;
  documentType: DocumentType;
  title: string;
  exchange: 'NSE' | 'BSE' | string;
  announcementDate: string | null;
  reportingPeriod: string | null;
  sourceUrl: string | null;
  sourcePublishedAt: string | null;
  fetchedAt: string;
  availability: 'complete' | 'partial' | 'unavailable';
  
  // Optional summary content
  summary?: {
    fact: string;
    generatedContent?: string;
    missingData?: string[];
    isUncertain: boolean;
  };
}
