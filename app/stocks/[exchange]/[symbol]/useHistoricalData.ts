import { useState, useEffect, useMemo } from "react";
import type { HistoricalPrice, HistoricalRange } from "../../../../src/domain/equity/types";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };
const unavailable = <T,>(message: string): Result<T> => ({ data: null, metadata: { availability: "unavailable", asOf: null }, error: { message } });

export function useHistoricalData(instrumentKey: string, range: HistoricalRange) {
  const [history, setHistory] = useState<Result<HistoricalPrice[]> | null>(null);

  useEffect(() => {
    setHistory(null);
    fetch(`/api/stocks/history?instrumentKey=${encodeURIComponent(instrumentKey)}&range=${range}`)
      .then(async response => setHistory(await response.json()))
      .catch(() => setHistory(unavailable("Historical data temporarily unavailable.")));
  }, [range, instrumentKey]);

  const points = useMemo(() => history?.data?.filter(point => point.close !== null) ?? [], [history]);
  const isIntraday = ["1m", "5m", "15m", "1h", "1D"].includes(range);

  return { history, points, isIntraday };
}
