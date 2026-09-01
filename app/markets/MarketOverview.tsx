"use client";
import { useEffect, useState } from "react";
import { formatIndianNumber, formatPercent } from "../../src/lib/financial-format";
import styles from "./markets.module.css";

type IndexQuote = { name: string; price: number | null; change: number | null; changePercent: number | null; open: number | null; high: number | null; low: number | null; previousClose: number | null; timestamp: string | null };

function getMarketStatus() {
  const now = new Date();
  const options = { timeZone: "Asia/Kolkata", hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'short' } as const;
  const timeStr = now.toLocaleString("en-US", options);

  // timeStr format: "Mon, 14:30"
  const parts = timeStr.split(', ');
  if (parts.length !== 2) return "UNKNOWN";

  const weekday = parts[0];
  const time = parts[1];

  if (['Sat', 'Sun'].includes(weekday)) return "MARKET CLOSED";

  const [hh, mm] = time.split(':').map(Number);
  const totalMinutes = hh * 60 + mm;

  if (totalMinutes >= 9 * 60 && totalMinutes < 9 * 60 + 15) return "PRE-OPEN";
  if (totalMinutes >= 9 * 60 + 15 && totalMinutes < 15 * 60 + 30) return "MARKET OPEN";
  return "MARKET CLOSED";
}

export default function MarketOverview() {
  const [result, setResult] = useState<{ data: IndexQuote[] | null; error?: { message?: string } } | null>(null);
  const [status, setStatus] = useState<string>("...");

  useEffect(() => {
    setStatus(getMarketStatus());
    const interval = setInterval(() => setStatus(getMarketStatus()), 60000);
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
