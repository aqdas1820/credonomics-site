import { useState, useEffect } from "react";
import type { CompanyFundamentals, CorporateAction, MarketQuote, Shareholding } from "../../../../src/domain/equity/types";
import type { CompanyFinancials } from "../../../../src/domain/equity/financial-intelligence";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };
const unavailable = <T,>(message: string): Result<T> => ({ data: null, metadata: { availability: "unavailable", asOf: null }, error: { message } });

export function useMarketData(instrumentKey: string) {
  const [quote, setQuote] = useState<Result<MarketQuote> | null>(null);
  const [fundamentals, setFundamentals] = useState<Result<CompanyFundamentals> | null>(null);
  const [shareholding, setShareholding] = useState<Result<Shareholding> | null>(null);
  const [actions, setActions] = useState<Result<CorporateAction[]> | null>(null);
  const [financials, setFinancials] = useState<Result<CompanyFinancials> | null>(null);

  useEffect(() => {
    const query = `instrumentKey=${encodeURIComponent(instrumentKey)}`;
    Promise.all([
      fetch(`/api/stocks/quote?${query}`).then(r => r.json()).catch(() => unavailable("Market data temporarily unavailable.")),
      fetch(`/api/stocks/fundamentals?${query}`).then(r => r.json()).catch(() => unavailable("Fundamentals temporarily unavailable.")),
      fetch(`/api/stocks/shareholding?${query}`).then(r => r.json()).catch(() => unavailable("Shareholding data temporarily unavailable.")),
      fetch(`/api/stocks/corporate-actions?${query}`).then(r => r.json()).catch(() => unavailable("Corporate actions temporarily unavailable.")),
      fetch(`/api/stocks/financial-intelligence?${query}`).then(r => r.json()).catch(() => unavailable("Financial data temporarily unavailable."))
    ]).then(([quoteRes, fundRes, shareRes, actionsRes, finRes]) => {
      setQuote(quoteRes);
      setFundamentals(fundRes);
      setShareholding(shareRes);
      setActions(actionsRes);
      setFinancials(finRes);
    });
  }, [instrumentKey]);

  return { quote, fundamentals, shareholding, actions, financials };
}
