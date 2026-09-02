"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CompanyFundamentals, CorporateAction, HistoricalPrice, HistoricalRange, IndianEquityIdentity, MarketQuote, Shareholding } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency, formatIndianNumber as formatNumber, formatPercent } from "../../../../src/lib/financial-format";
import { getIndianMarketSession, marketSessionLabel } from "../../../../src/domain/market/session";
import styles from "./stock-detail.module.css";
import StockTrackerActions from "../../../components/StockTrackerActions";

const InteractiveChart = dynamic(() => import("./InteractiveChart"), { ssr: false, loading: () => <p>Loading interactive chart...</p> });

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };
const ranges: HistoricalRange[] = ["1m", "5m", "15m", "1h", "1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y"];
const unavailable = <T,>(message: string): Result<T> => ({ data: null, metadata: { availability: "unavailable", asOf: null }, error: { message } });

export default function StockDetailClient({ stock }: { stock: IndianEquityIdentity }) {
  const [quote, setQuote] = useState<Result<MarketQuote> | null>(null);
  const [history, setHistory] = useState<Result<HistoricalPrice[]> | null>(null);
  const [fundamentals, setFundamentals] = useState<Result<CompanyFundamentals> | null>(null);
  const [shareholding, setShareholding] = useState<Result<Shareholding> | null>(null);
  const [actions, setActions] = useState<Result<CorporateAction[]> | null>(null);
  const [range, setRange] = useState<HistoricalRange>("1D");
  const [marketSession, setMarketSession] = useState(() => getIndianMarketSession());

  useEffect(() => {
    const update = () => setMarketSession(getIndianMarketSession());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const query = `instrumentKey=${encodeURIComponent(stock.instrumentKey)}`;
    fetch(`/api/stocks/quote?${query}`).then(async response => setQuote(await response.json())).catch(() => setQuote(unavailable("Market data temporarily unavailable.")));
    fetch(`/api/stocks/fundamentals?${query}`).then(async response => setFundamentals(await response.json())).catch(() => setFundamentals(unavailable("Fundamentals temporarily unavailable.")));
    fetch(`/api/stocks/shareholding?${query}`).then(async response => setShareholding(await response.json())).catch(() => setShareholding(unavailable("Shareholding data temporarily unavailable.")));
    fetch(`/api/stocks/corporate-actions?${query}`).then(async response => setActions(await response.json())).catch(() => setActions(unavailable("Corporate actions temporarily unavailable.")));
  }, [stock.instrumentKey]);

  // Fallback for 52W High/Low using 1Y history
  const [history1Y, setHistory1Y] = useState<Result<HistoricalPrice[]> | null>(null);
  useEffect(() => {
    if (quote?.data && (quote.data.fiftyTwoWeekHigh === null || quote.data.fiftyTwoWeekLow === null)) {
      fetch(`/api/stocks/history?instrumentKey=${encodeURIComponent(stock.instrumentKey)}&range=1Y`)
        .then(async response => setHistory1Y(await response.json()))
        .catch(() => setHistory1Y(unavailable("1Y data unavailable.")));
    }
  }, [quote?.data, stock.instrumentKey]);

  const computed52W = useMemo(() => {
    if (!history1Y?.data?.length) return null;
    const highs = history1Y.data.map(p => p.high as number).filter(h => h !== null);
    const lows = history1Y.data.map(p => p.low as number).filter(l => l !== null);
    if (!highs.length || !lows.length) return null;
    return { high: Math.max(...highs), low: Math.min(...lows) };
  }, [history1Y]);

  const display52WHigh = quote?.data?.fiftyTwoWeekHigh ?? computed52W?.high ?? null;
  const display52WLow = quote?.data?.fiftyTwoWeekLow ?? computed52W?.low ?? null;

  useEffect(() => {
    setHistory(null);
    fetch(`/api/stocks/history?instrumentKey=${encodeURIComponent(stock.instrumentKey)}&range=${range}`)
      .then(async response => setHistory(await response.json()))
      .catch(() => setHistory(unavailable("Historical data temporarily unavailable.")));
  }, [range, stock.instrumentKey]);

  const points = useMemo(() => history?.data?.filter(point => point.close !== null) ?? [], [history]);
  const isIntraday = ["1m", "5m", "15m", "1h", "1D"].includes(range);

  return <main className={styles.page}>

    {/* HEADER */}
    <header className={styles.brokerHeader}>
      <div className={styles.headerTitle}>
        <h1>{stock.companyName}</h1>
        <span className={styles.exchangeBadge}>{stock.symbol} • {stock.exchange}</span>
      </div>
      {quote?.data ? (
        <div className={styles.headerPriceData}>
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatCurrency(quote.data.price, "N/A")}</span>
            {quote.data.change !== null ? (
              <span className={quote.data.change >= 0 ? styles.up : styles.down}>
                {quote.data.change > 0 ? "+" : ""}{formatCurrency(quote.data.change, "N/A")} ({formatPercent(quote.data.changePercent, "N/A")})
              </span>
            ) : (
              <span className={styles.notice}>Change N/A</span>
            )}
          </div>
          <small className={styles.timestamp}>
            {marketSession === "OPEN" ? <span className={styles.liveIndicator}></span> : null}
            {marketSessionLabel(marketSession)} · {quote.metadata.asOf ? new Date(quote.metadata.asOf).toLocaleString("en-IN") : "Timestamp unavailable"}
          </small>
        </div>
      ) : quote ? (
        <p className={styles.notice}>{quote.error?.message ?? "Market data temporarily unavailable."}</p>
      ) : (
        <div className={styles.headerPriceData}><p>Loading market quote…</p></div>
      )}
    </header>
    <StockTrackerActions stock={{ instrumentKey: stock.instrumentKey, symbol: stock.symbol, exchange: stock.exchange, companyName: stock.companyName }} />

    <div className={styles.brokerLayout}>
      {/* MAIN CHART AREA */}
      <div className={styles.mainContent}>
        <section className={styles.chartCard}>
          <div className={styles.chartControls}>
            <div className={styles.range}>
              {ranges.map(item => (
                <button key={item} className={item === range ? styles.selected : ""} onClick={() => setRange(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartArea}>
            {!history ? (
              <div className={styles.chartLoading}>Loading price history…</div>
            ) : points.length ? (
              <>
                {history.metadata.session === "previous" ? <p className={styles.notice}>Previous trading session · {history.metadata.sessionDate}</p> : null}
                <InteractiveChart points={points} isIntraday={isIntraday} />
              </>
            ) : (
              <p className={styles.notice}>{history.error ? "Chart data is unavailable for this interval." : "No trading-session data is available yet."}</p>
            )}
          </div>
        </section>
      </div>

      {/* SIDEBAR FOR STATS */}
      <aside className={styles.sidebar}>

        {/* QUICK STATS */}
        <section className={styles.statsCard}>
          <h2>Market Statistics</h2>
          <div className={styles.brokerGrid}>
            {[
              ["Open", quote?.data?.open, "currency"],
              ["Previous Close", quote?.data?.previousClose, "currency"],
              ["Day High", quote?.data?.high, "currency"],
              ["Day Low", quote?.data?.low, "currency"],
              ["52W High", display52WHigh, "currency"],
              ["52W Low", display52WLow, "currency"],
              ["Volume", quote?.data?.volume, "number"]
            ].map(([label, value, type]) => (
              <div key={String(label)} className={styles.gridItem}>
                <span className={styles.gridLabel}>{label}</span>
                <strong className={styles.gridValue}>
                  {type === "number" ? formatNumber(value as number | null, "N/A") : formatCurrency(value as number | null, "N/A")}
                </strong>
              </div>
            ))}
          </div>
        </section>

        {/* FUNDAMENTALS */}
        <section className={styles.statsCard}>
          <h2>Fundamentals</h2>
          {fundamentals?.data ? (
            <div className={styles.brokerGrid}>
              {[
                ["P/E Ratio", fundamentals.data.pe],
                ["P/B Ratio", fundamentals.data.pb],
                ["ROE", fundamentals.data.roe],
                ["ROCE", fundamentals.data.roce],
                ["ROA", fundamentals.data.roa],
                ["EV/EBITDA", fundamentals.data.evEbitda]
              ].map(([label, value]) => (
                <div key={String(label)} className={styles.gridItem}>
                  <span className={styles.gridLabel}>{label}</span>
                  <strong className={styles.gridValue}>{formatNumber(value as number | null, "N/A")}</strong>
                </div>
              ))}
            </div>
          ) : fundamentals ? (
            <p className={styles.notice}>{fundamentals.error?.message ?? "Fundamentals unavailable."}</p>
          ) : (
            <p className={styles.loading}>Loading fundamentals…</p>
          )}
        </section>

        {/* SHAREHOLDING */}
        <section className={styles.statsCard}>
          <h2>Shareholding</h2>
          {shareholding?.data ? (
            <div className={styles.brokerGrid}>
              {[
                ["Promoters", shareholding.data.promoterHolding],
                ["FII", shareholding.data.fiiHolding],
                ["DII", shareholding.data.diiHolding],
                ["Mutual Funds", shareholding.data.mutualFundHolding],
                ["Public", shareholding.data.publicHolding]
              ].map(([label, value]) => (
                <div key={String(label)} className={styles.gridItem}>
                  <span className={styles.gridLabel}>{label}</span>
                  <strong className={styles.gridValue}>{formatPercent(value as number | null, "N/A")}</strong>
                </div>
              ))}
            </div>
          ) : shareholding ? (
            <p className={styles.notice}>{shareholding.error?.message ?? "Shareholding unavailable."}</p>
          ) : (
            <p className={styles.loading}>Loading shareholding…</p>
          )}
        </section>

        {/* CORPORATE ACTIONS */}
        <section className={styles.statsCard}>
          <h2>Corporate Actions</h2>
          {actions?.data?.length ? (
            <div className={styles.actionList}>
              {actions.data.slice(0, 5).map((action, index) => (
                <article key={`${action.type}-${action.recordDate}-${index}`} className={styles.actionItem}>
                  <strong>{action.type.toUpperCase()}</strong>
                  <span>{action.description}</span>
                  <small>Ex-date: {action.exDate ?? "N/A"} · Record: {action.recordDate ?? "N/A"}</small>
                </article>
              ))}
            </div>
          ) : actions ? (
            <p className={styles.notice}>{actions.error?.message ?? "No corporate actions returned."}</p>
          ) : (
            <p className={styles.loading}>Loading corporate actions…</p>
          )}
        </section>
      </aside>
    </div>
  </main>;
}
