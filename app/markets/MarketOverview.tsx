"use client";
import { useEffect, useState } from "react";
import { formatIndianNumber, formatPercent } from "../../src/lib/financial-format";
import { getIndianMarketSession, marketSessionLabel } from "../../src/domain/market/session";
import styles from "./markets.module.css";

type IndexQuote = { name: string; price: number | null; change: number | null; changePercent: number | null; open: number | null; high: number | null; low: number | null; previousClose: number | null; timestamp: string | null };

export default function MarketOverview() {
  const [result, setResult] = useState<{ data: IndexQuote[] | null; error?: { message?: string } } | null>(null);
  const [status, setStatus] = useState<string>("...");

  useEffect(() => {
    const updateStatus = () => setStatus(marketSessionLabel(getIndianMarketSession()));
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    fetch("/api/markets/overview")
      .then(async response => setResult(await response.json()))
      .catch(() => setResult({ data: null, error: { message: "Market data temporarily unavailable." } }));
    return () => clearInterval(interval);
  }, []);

  if (!result) return <section className={styles.overview}><p>Loading live market overview…</p></section>;
  if (!result.data) return <section className={styles.overview}><p>{result.error?.message ?? "Market data temporarily unavailable."}</p></section>;

  return (
    <div className={styles.overviewWrapper}>
      <div className={styles.marketStatus}>
        <span className={status === "MARKET OPEN" ? styles.statusOpen : styles.statusClosed}></span>
        <strong>{status}</strong>
      </div>
      <section className={styles.overview} aria-label="Live Indian market overview">
        {result.data.map(item => (
          <article key={item.name}>
            <span>{item.name}</span>
            <strong>{formatIndianNumber(item.price, "N/A")}</strong>

            {item.change !== null ? (
              <em className={item.change >= 0 ? styles.positive : styles.negative}>
                {item.change > 0 ? "+" : ""}{formatIndianNumber(item.change, "N/A")} · {formatPercent(item.changePercent, "N/A")}
              </em>
            ) : (
              <em className={styles.neutral}>Change N/A</em>
            )}

            <small>O {formatIndianNumber(item.open, "N/A")} · H {formatIndianNumber(item.high, "N/A")} · L {formatIndianNumber(item.low, "N/A")}</small>
            <small>Prev. {formatIndianNumber(item.previousClose, "N/A")}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
