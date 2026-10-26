"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketPulse as MarketPulseData } from "../../src/domain/market/pulse";
import { formatIndianNumber, formatPercent } from "../../src/lib/financial-format";
import styles from "./home-market-pulse.module.css";

type Response = {
  data: MarketPulseData | null;
  metadata?: { availability?: string };
  error?: { message?: string };
};

function trendValue(trend: MarketPulseData["trends"][number]) {
  if (trend.unit === "%") return formatPercent(trend.value, "N/A");
  if (trend.unit === "stocks")
    return `${trend.value > 0 ? "+" : ""}${trend.value} net stocks`;
  return `${trend.value > 0 ? "+" : ""}Rs ${formatIndianNumber(trend.value)} cr`;
}

export default function HomeMarketPulse() {
  const [result, setResult] = useState<Response | null>(null);

  useEffect(() => {
    fetch("/api/markets/pulse")
      .then(async (response) => setResult(await response.json()))
      .catch(() =>
        setResult({ data: null, error: { message: "Market pulse is temporarily unavailable." } }),
      );
  }, []);

  if (!result) {
    return (
      <div className={styles.pulsePanel} data-cm-reveal>
        <div>
          <span className={styles.sectionEyebrow}>MARKET PULSE</span>
          <h2>Loading market pulse…</h2>
          <p>Fetching the same verified pulse feed used on the Markets page.</p>
        </div>
        <Link href="/markets">Open Markets</Link>
      </div>
    );
  }

  // Failure: do not invent a composite score or estimated values.
  if (!result.data) {
    return (
      <div className={styles.pulsePanel} data-cm-reveal>
        <div>
          <span className={styles.sectionEyebrow}>MARKET PULSE</span>
          <h2>Market pulse temporarily unavailable</h2>
          <p>
            {result.error?.message ??
              "Market intelligence is temporarily unavailable."}{" "}
            No composite score is shown when verified pulse data is missing.
          </p>
        </div>
        <Link href="/markets">Open Markets</Link>
      </div>
    );
  }

  const pulse = result.data;
  const availability =
    result.metadata?.availability === "live" ? "Live market data" : "Latest available data";

  return (
    <div className={styles.pulsePanel} data-cm-reveal>
      <div className={styles.copy}>
        <span className={styles.sectionEyebrow}>MARKET PULSE</span>
        <h2>Market pulse</h2>
        {pulse.summary.length ? (
          <p className={styles.summary}>{pulse.summary.join(" ")}</p>
        ) : null}
        {pulse.breadth ? (
          <p className={styles.breadth}>
            Tracked breadth: {pulse.breadth.advances} advances ·{" "}
            {pulse.breadth.declines} declines · {pulse.breadth.unchanged}{" "}
            unchanged ({pulse.breadth.universeSize} tracked stocks)
          </p>
        ) : null}
        {pulse.trends.length ? (
          <ul className={styles.trends}>
            {pulse.trends.map((trend) => (
              <li key={trend.label}>
                <span>{trend.label}</span>
                <strong>{trend.classification}</strong>
                <em
                  className={
                    trend.value > 0
                      ? styles.positive
                      : trend.value < 0
                        ? styles.negative
                        : styles.neutral
                  }
                >
                  {trendValue(trend)}
                </em>
              </li>
            ))}
          </ul>
        ) : null}
        <p className={styles.note}>
          {availability} · Rules-based factual summary, not investment advice. No
          composite score is calculated.
        </p>
      </div>
      <div className={styles.links}>
        <Link href="/markets">Open Markets</Link>
        <Link href="/methodology">How data is handled</Link>
      </div>
    </div>
  );
}
