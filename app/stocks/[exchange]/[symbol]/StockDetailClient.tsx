"use client";
import { useEffect, useMemo, useState } from "react";
import type { CompanyFundamentals, CorporateAction, HistoricalPrice, HistoricalRange, IndianEquityIdentity, MarketQuote, Shareholding } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency, formatIndianNumber as formatNumber, formatPercent } from "../../../../src/lib/financial-format";
import styles from "./stock-detail.module.css";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null }; error?: { message: string } };
const ranges: HistoricalRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y"];
const unavailable = <T,>(message: string): Result<T> => ({ data: null, metadata: { availability: "unavailable", asOf: null }, error: { message } });

export default function StockDetailClient({ stock }: { stock: IndianEquityIdentity }) {
  const [quote, setQuote] = useState<Result<MarketQuote> | null>(null);
  const [history, setHistory] = useState<Result<HistoricalPrice[]> | null>(null);
  const [fundamentals, setFundamentals] = useState<Result<CompanyFundamentals> | null>(null);
  const [shareholding, setShareholding] = useState<Result<Shareholding> | null>(null);
  const [actions, setActions] = useState<Result<CorporateAction[]> | null>(null);
  const [range, setRange] = useState<HistoricalRange>("1M");

  useEffect(() => {
    const query = `instrumentKey=${encodeURIComponent(stock.instrumentKey)}`;
    fetch(`/api/stocks/quote?${query}`).then(async response => setQuote(await response.json())).catch(() => setQuote(unavailable("Market data temporarily unavailable.")));
    fetch(`/api/stocks/fundamentals?${query}`).then(async response => setFundamentals(await response.json())).catch(() => setFundamentals(unavailable("Fundamentals temporarily unavailable.")));
    fetch(`/api/stocks/shareholding?${query}`).then(async response => setShareholding(await response.json())).catch(() => setShareholding(unavailable("Shareholding data temporarily unavailable.")));
    fetch(`/api/stocks/corporate-actions?${query}`).then(async response => setActions(await response.json())).catch(() => setActions(unavailable("Corporate actions temporarily unavailable.")));
  }, [stock.instrumentKey]);
  useEffect(() => { setHistory(null); fetch(`/api/stocks/history?instrumentKey=${encodeURIComponent(stock.instrumentKey)}&range=${range}`).then(async response => setHistory(await response.json())).catch(() => setHistory(unavailable("Historical data temporarily unavailable."))); }, [range, stock.instrumentKey]);
  const points = useMemo(() => history?.data?.filter(point => point.close !== null) ?? [], [history]);

  return <main className={styles.page}>
    <header><span>{stock.symbol} • {stock.exchange}</span><h1>{stock.companyName}</h1>{quote?.data ? <><div className={styles.price}>{formatCurrency(quote.data.price, "N/A")}</div><div className={(quote.data.change ?? 0) >= 0 ? styles.up : styles.down}>{formatCurrency(quote.data.change, "N/A")} · {formatPercent(quote.data.changePercent, "N/A")}</div><small>{quote.metadata.availability.toUpperCase()} · {quote.metadata.asOf ? new Date(quote.metadata.asOf).toLocaleString("en-IN") : "Timestamp unavailable"}</small></> : quote ? <p className={styles.notice}>{quote.error?.message ?? "Market data temporarily unavailable."}</p> : <p>Loading market quote…</p>}</header>
    <section className={styles.card}><div className={styles.range}>{ranges.map(item => <button key={item} className={item === range ? styles.selected : ""} onClick={() => setRange(item)}>{item}</button>)}</div>{!history ? <p>Loading price history…</p> : points.length ? <PriceChart points={points} /> : <p className={styles.notice}>{history.error?.message ?? "No historical data available."}</p>}</section>
    <section className={styles.grid}>{[["Open", quote?.data?.open], ["Previous Close", quote?.data?.previousClose], ["Day High", quote?.data?.high], ["Day Low", quote?.data?.low], ["52 Week High", quote?.data?.fiftyTwoWeekHigh], ["52 Week Low", quote?.data?.fiftyTwoWeekLow], ["Volume", quote?.data?.volume]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{label === "Volume" ? formatNumber(value as number | null, "N/A") : formatCurrency(value as number | null, "N/A")}</strong></div>)}</section>
    <section className={styles.card}><h2>Company fundamentals</h2>{fundamentals?.data ? <div className={styles.grid}>{[["P/E", fundamentals.data.pe], ["P/B", fundamentals.data.pb], ["ROE", fundamentals.data.roe], ["ROCE", fundamentals.data.roce], ["ROA", fundamentals.data.roa], ["EV/EBITDA", fundamentals.data.evEbitda]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{formatNumber(value as number | null, "N/A")}</strong></div>)}</div> : fundamentals ? <p className={styles.notice}>{fundamentals.error?.message ?? "Fundamentals unavailable."}</p> : <p>Loading fundamentals…</p>}</section>
    <section className={styles.card}><h2>Shareholding</h2>{shareholding?.data ? <div className={styles.grid}>{[["Promoters", shareholding.data.promoterHolding], ["FII", shareholding.data.fiiHolding], ["DII", shareholding.data.diiHolding], ["Mutual funds", shareholding.data.mutualFundHolding], ["Public / other", shareholding.data.publicHolding]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{formatPercent(value as number | null, "N/A")}</strong></div>)}</div> : shareholding ? <p className={styles.notice}>{shareholding.error?.message ?? "Shareholding unavailable."}</p> : <p>Loading shareholding…</p>}</section>
    <section className={styles.card}><h2>Corporate actions</h2>{actions?.data?.length ? <div className={styles.actionList}>{actions.data.slice(0, 8).map((action, index) => <article key={`${action.type}-${action.recordDate}-${index}`}><strong>{action.type.toUpperCase()}</strong><span>{action.description}</span><small>Ex-date {action.exDate ?? "N/A"} · Record date {action.recordDate ?? "N/A"}</small></article>)}</div> : actions ? <p>{actions.error?.message ?? "No corporate actions returned."}</p> : <p>Loading corporate actions…</p>}</section>
  </main>;
}

function PriceChart({ points }: { points: HistoricalPrice[] }) { const values = points.map(point => point.close as number); const min = Math.min(...values); const max = Math.max(...values); const span = max - min || 1; const path = values.map((value, index) => `${index ? "L" : "M"}${(index / (values.length - 1 || 1)) * 100},${100 - ((value - min) / span) * 90}`).join(" "); return <svg className={styles.chart} viewBox="0 0 100 105" preserveAspectRatio="none" role="img" aria-label="Historical closing price chart"><path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>; }
