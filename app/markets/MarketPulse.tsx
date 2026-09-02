"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketPulse as MarketPulseData, PulseQuote } from "../../src/domain/market/pulse";
import { formatFinancialDate, formatIndianNumber, formatPercent } from "../../src/lib/financial-format";
import styles from "./markets.module.css";

type Response = { data: MarketPulseData | null; error?: { message?: string }; metadata?: { availability?: string } };
const signed = (value: number | null) => value === null ? "N/A" : `${value > 0 ? "+" : ""}${formatIndianNumber(value)}`;
const tone = (value: number | null) => value === null ? styles.neutral : value >= 0 ? styles.positive : styles.negative;
const volume = (value: number | null) => value === null ? "N/A" : new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 2 }).format(value);

function QuoteRows({ rows, showVolume = false }: { rows: PulseQuote[]; showVolume?: boolean }) {
  return <div className={styles.pulseRows}>{rows.map(row => <Link href={`/stocks/nse/${encodeURIComponent(row.symbol)}`} key={row.instrumentKey}>
    <div className={styles.quoteIdentity}><strong>{row.name}</strong><span>{row.symbol}</span></div>
    {showVolume ? <div><small>Volume</small><strong>{volume(row.volume)}</strong></div> : null}
    <div className={styles.quoteValue}><strong>{formatIndianNumber(row.price, "N/A")}</strong><span className={tone(row.change)}>{signed(row.change)} ({formatPercent(row.changePercent, "N/A")})</span></div>
  </Link>)}</div>;
}

export default function MarketPulse() {
  const [result, setResult] = useState<Response | null>(null);
  useEffect(() => { fetch("/api/markets/pulse").then(async response => setResult(await response.json())).catch(() => setResult({ data: null, error: { message: "Market intelligence is temporarily unavailable." } })); }, []);
  if (!result) return <section className={styles.pulseLoading}>Loading market intelligence...</section>;
  if (!result.data) return <section className={styles.pulseLoading}>{result.error?.message ?? "Market intelligence is temporarily unavailable."}</section>;
  const pulse = result.data;
  const breadth = pulse.breadth;
  const advancesWidth = breadth ? breadth.advances / breadth.universeSize * 100 : 0;
  const unchangedWidth = breadth ? breadth.unchanged / breadth.universeSize * 100 : 0;
  return <section className={styles.intelligence} aria-labelledby="market-pulse-title">
    <header className={styles.intelligenceHead}><div><span>Market intelligence</span><h2 id="market-pulse-title">Market pulse</h2></div><small>{result.metadata?.availability === "live" ? "Live market data" : "Latest available data"}{pulse.asOf ? ` · ${formatFinancialDate(pulse.asOf)}` : ""}</small></header>

    {pulse.summary.length ? <article className={styles.summary}><span>Session read</span><ul>{pulse.summary.map(sentence => <li key={sentence}>{sentence}</li>)}</ul><small>Rules-based factual summary, not investment advice.</small></article> : null}

    {pulse.trends.length ? <div className={styles.trendGrid}>{pulse.trends.map(item => <article key={item.label}><span>{item.label}</span><strong>{item.classification}</strong><em className={tone(item.value)}>{item.unit === '%' ? formatPercent(item.value) : item.unit === 'stocks' ? `${item.value > 0 ? '+' : ''}${item.value} net stocks` : `${item.value > 0 ? '+' : ''}Rs ${formatIndianNumber(item.value)} cr`}</em></article>)}</div> : null}

    <div className={styles.pulseColumns}>
      {pulse.movers.gainers.length ? <article className={styles.dataPanel}><header><div><span>Leaders</span><h3>Top gainers</h3></div><small>Liquid NSE snapshot</small></header><QuoteRows rows={pulse.movers.gainers} /></article> : null}
      {pulse.movers.losers.length ? <article className={styles.dataPanel}><header><div><span>Laggers</span><h3>Top losers</h3></div><small>Liquid NSE snapshot</small></header><QuoteRows rows={pulse.movers.losers} /></article> : null}
    </div>

    {breadth ? <article className={styles.breadth}><header><div><span>Participation</span><h3>Tracked liquid NSE breadth</h3></div><small>{breadth.universeSize} verified quotes</small></header><div className={styles.breadthBar} aria-label={`${breadth.advances} advances, ${breadth.declines} declines, ${breadth.unchanged} unchanged`}><i style={{width:`${advancesWidth}%`}}/><i className={styles.unchangedBar} style={{width:`${unchangedWidth}%`}}/><i className={styles.declineBar}/></div><div className={styles.breadthLabels}><span><b>{breadth.advances}</b> Advances</span><span><b>{breadth.unchanged}</b> Unchanged</span><span><b>{breadth.declines}</b> Declines</span></div></article> : null}

    {pulse.sectors.length ? <div><div className={styles.subhead}><span>Sector trends</span><h3>Sector performance</h3></div><div className={styles.sectorGrid}>{pulse.sectors.map(item => <article key={item.instrumentKey}><span>{item.name.replace(/^Nifty /, "")}</span><strong>{formatIndianNumber(item.price, "N/A")}</strong><em className={tone(item.changePercent)}>{formatPercent(item.changePercent, "N/A")}</em></article>)}</div></div> : null}

    {pulse.flows.length ? <div><div className={styles.subhead}><span>Institutional activity</span><h3>FII / DII cash flows</h3></div><div className={styles.flowGrid}>{pulse.flows.map(item => <article key={item.label}><header><strong>{item.label}</strong><span>{item.segment}</span></header><dl><div><dt>Buy</dt><dd>Rs {formatIndianNumber(item.buy)} cr</dd></div><div><dt>Sell</dt><dd>Rs {formatIndianNumber(item.sell)} cr</dd></div><div><dt>Net</dt><dd className={tone(item.net)}>{item.net > 0 ? "+" : ""}Rs {formatIndianNumber(item.net)} cr</dd></div></dl><small>Reported {formatFinancialDate(item.timestamp)}</small></article>)}</div></div> : null}

    <div className={styles.pulseColumns}>
      {pulse.movers.mostActive.length ? <article className={styles.dataPanel}><header><div><span>Trading activity</span><h3>Most active by volume</h3></div><small>Liquid NSE snapshot</small></header><QuoteRows rows={pulse.movers.mostActive} showVolume /></article> : null}
      {pulse.globals.length ? <article className={styles.dataPanel}><header><div><span>Overseas cues</span><h3>Global markets</h3></div><small>Provider latency shown</small></header><div className={styles.globalRows}>{pulse.globals.map(item => <div key={item.instrumentKey}><div><strong>{item.name}</strong><small>Delay {item.latency}</small></div><div><strong>{formatIndianNumber(item.price, "N/A")}</strong><span className={tone(item.changePercent)}>{formatPercent(item.changePercent, "N/A")}</span></div></div>)}</div></article> : null}
    </div>
    <p className={styles.scopeNote}>Movers, breadth and activity are calculated only from the verified liquid-stock snapshot shown here; they are not exchange-wide rankings.</p>
  </section>;
}
