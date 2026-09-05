import { useState, useEffect } from "react";
import type { MFPortfolioData } from "../../src/domain/mf/types";

type Result<T> = { data: T | null; error?: { message: string } };

export function useMFData(isin: string) {
  const [portfolio, setPortfolio] = useState<Result<MFPortfolioData> | null>(null);

  useEffect(() => {
    if (!isin) return;
    
    setPortfolio(null);
    
    Promise.all([
      fetch(`/api/mf/portfolio?isin=${encodeURIComponent(isin)}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
    ]).then(([portfolioRes]) => {
      setPortfolio(portfolioRes);
    }).catch(() => {
      setPortfolio({ data: null, error: { message: "Mutual fund data temporarily unavailable." } });
    });
  }, [isin]);

  return { portfolio };
}
