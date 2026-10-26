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

export default function HomeMarketPulse() {
  const [result, setResult] = useState<Response | null>(null);

  useEffect(() => {
    fetch("/api/markets/pulse")
      .then(async (response) => setResult(await response.json()))
      .catch(() =>
        setResult({ data: null, error: { message: "Market pulse is temporarily unavailable." } }),
      );
  }, []);

  // Loading: same panel structure as the loaded state (summary, breadth,
  // flows, three gainers, three sectors, note, and both links), with static
  // aria-hidden bars in place of values, so the panel does not jump in size
  // when the verified pulse data arrives. The bars are placeholders, never
  // fake values.
  if (!result) {
    return (
      <div className={styles.pulsePanel} data-cm-reveal aria-busy="true">
        <div className={styles.copy}>
          <span className={styles.sectionEyebrow}>MARKET PULSE</span>
          <h2>Loading market pulse…</h2>
          <div aria-hidden="true">
            <span className={`${styles.skeleton} ${styles.skeletonSummary}`} />
            <span className={`${styles.skeleton} ${styles.skeletonSummaryShort}`} />
            <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
            <span className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
            <p className={styles.subhead}>Top gainers</p>
            <ul className={styles.trends}>
              {[0, 1, 2].map((row) => (
                <li key={row}>
                  <span className={`${styles.skeleton} ${styles.skeletonName}`} />
                  <strong className={`${styles.skeleton} ${styles.skeletonValue}`} />
                </li>
              ))}
            </ul>
            <p className={styles.subhead}>Top sectors</p>
            <ul className={styles.trends}>
              {[0, 1, 2].map((row) => (
                <li key={row}>
                  <span className={`${styles.skeleton} ${styles.skeletonName}`} />
                  <strong className={`${styles.skeleton} ${styles.skeletonValue}`} />
                </li>
              ))}
            </ul>
            <span className={`${styles.skeleton} ${styles.skeletonNote}`} />
          </div>
        </div>
        <div className={styles.links}>
          <Link href="/markets">Open Markets</Link>
          <Link href="/methodology">How data is handled</Link>
        </div>
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
  // Index trends are intentionally NOT shown here: the Market Status section
  // above already shows NIFTY 50, SENSEX, BANK NIFTY and INDIA VIX. This panel
  // shows only pulse data that Market Status does not show.
  const gainers = pulse.movers.gainers.slice(0, 3);
  const topSectors = [...pulse.sectors]
    .filter((sector) => sector.changePercent !== null)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 3);

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
        {pulse.flows.length ? (
          <p className={styles.breadth}>
            {pulse.flows
              .map(
                (flow) =>
                  `${flow.label} net ${flow.net > 0 ? "+" : ""}Rs ${formatIndianNumber(flow.net)} cr`,
              )
              .join(" · ")}
          </p>
        ) : null}
        {gainers.length ? (
          <>
            <p className={styles.subhead}>Top gainers</p>
            <ul className={styles.trends}>
              {gainers.map((row) => (
                <li key={row.instrumentKey}>
                  <span>
                    {row.name} · {row.symbol}
                  </span>
                  <strong>{formatIndianNumber(row.price, "N/A")}</strong>
                  <em
                    className={
                      row.changePercent === null
                        ? styles.neutral
                        : row.changePercent >= 0
                          ? styles.positive
                          : styles.negative
                    }
                  >
                    {formatPercent(row.changePercent, "N/A")}
                  </em>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {topSectors.length ? (
          <>
            <p className={styles.subhead}>Top sectors</p>
            <ul className={styles.trends}>
              {topSectors.map((sector) => (
                <li key={sector.instrumentKey}>
                  <span>{sector.name.replace(/^Nifty /, "")}</span>
                  <strong>{formatIndianNumber(sector.price, "N/A")}</strong>
                  <em
                    className={
                      sector.changePercent === null
                        ? styles.neutral
                        : sector.changePercent >= 0
                          ? styles.positive
                          : styles.negative
                    }
                  >
                    {formatPercent(sector.changePercent, "N/A")}
                  </em>
                </li>
              ))}
            </ul>
          </>
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
