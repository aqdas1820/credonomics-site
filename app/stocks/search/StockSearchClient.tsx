"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { IndianEquityIdentity } from "../../../src/domain/equity/types";
import { FinancialDataState, FinancialEmptyState, FinancialLoadingState } from "../../components/FinancialDataState";
import styles from "./stock-search.module.css";

type SearchResponse = { results: IndianEquityIdentity[]; error: { message: string } | null };

export default function StockSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IndianEquityIdentity[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(0);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setStatus("idle"); return; }
    const timer = window.setTimeout(async () => {
      request.current?.abort();
      request.current = new AbortController();
      setStatus("loading");
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`, { signal: request.current.signal });
        const payload = await response.json() as SearchResponse;
        if (!response.ok) throw new Error(payload.error?.message || "Stock search is temporarily unavailable.");
        setResults(payload.results); setActive(0); setStatus("ready");
      } catch (error) {
        if ((error as Error).name !== "AbortError") { setMessage((error as Error).message); setStatus("error"); }
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <span className={styles.eyebrow}>EQUITY DATA FOUNDATION</span>
        <h1>Search Indian listed companies.</h1>
        <p>Search by company name, NSE symbol, BSE code or ISIN. Results appear only when a verified provider or security master is connected.</p>
        <label className={styles.search}>
          <span>Company, symbol, BSE code or ISIN</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
            if (event.key === "Enter" && results[active]) { event.preventDefault(); window.location.assign(`/stocks/${results[active].exchange.toLowerCase()}/${encodeURIComponent(results[active].symbol)}`); }
          }} placeholder="Example: RELIANCE or INE002A01018" autoComplete="off" />
        </label>
        {status === "loading" ? <FinancialLoadingState label="Searching verified securities…" /> : null}
        {status === "error" ? <FinancialDataState availability="unavailable" message={message} /> : null}
        {status === "ready" && results.length === 0 ? <FinancialEmptyState title="No verified results" message="Try another company, symbol, BSE code or ISIN." /> : null}
        {results.length ? <ul className={styles.results}>{results.map((stock, index) => <li key={`${stock.exchange}:${stock.symbol}`} className={index === active ? styles.active : ""}><Link href={`/stocks/${stock.exchange.toLowerCase()}/${encodeURIComponent(stock.symbol)}`}><strong>{stock.companyName}</strong><span>{stock.exchange}: {stock.symbol}{stock.isin ? ` · ${stock.isin}` : ""}</span></Link></li>)}</ul> : null}
      </section>
    </main>
  );
}
