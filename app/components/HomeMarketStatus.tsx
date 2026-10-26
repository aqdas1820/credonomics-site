"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatIndianNumber, formatPercent } from "../../src/lib/financial-format";
import styles from "./home-market-status.module.css";

type IndexQuote = {
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
};

type Response = {
  data: IndexQuote[] | null;
  metadata?: { availability?: string; asOf?: string | null };
  error?: { message?: string };
};

function availabilityLabel(availability?: string) {
  if (availability === "live") return "Live index feed";
  if (availability === "recent") return "Latest index data";
  if (availability === "stale") return "Last available index data";
  return "Index data";
}

export default function HomeMarketStatus() {
  const [result, setResult] = useState<Response | null>(null);

  useEffect(() => {
    fetch("/api/markets/overview")
      .then(async (response) => setResult(await response.json()))
      .catch(() =>
        setResult({ data: null, error: { message: "Market index data is temporarily unavailable." } }),
      );
  }, []);

  // Loading: keep the bar visible, but do not claim the feed is unavailable
  // before the provider has actually been asked.
  if (!result) {
    return (
      <div className={styles.marketStatus} data-cm-reveal aria-label="Market data status">
        <div>
          <span>Market status</span>
          <strong>Loading index data…</strong>
        </div>
        <p>Fetching the same verified index feed used on the Markets page.</p>
        <Link href="/markets">
          Open Markets <span>→</span>
        </Link>
      </div>
    );
  }

  // Failure: preserve the previous behaviour exactly — never estimate or
  // invent values when the provider returns nothing.
  if (!result.data) {
    return (
      <div className={styles.marketStatus} data-cm-reveal aria-label="Market data status">
        <div>
          <span>Market status</span>
          <strong>Live index feed unavailable</strong>
        </div>
        <p>Verified market values will appear here when the connected provider is available.</p>
        <Link href="/markets">
          Open Markets <span>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.marketStatus} data-cm-reveal aria-label="Market data status">
      <div>
        <span>Market status</span>
        <strong>{availabilityLabel(result.metadata?.availability)}</strong>
      </div>
      <div className={styles.indices}>
        {result.data.map((item) => (
          <span key={item.name} className={styles.index}>
            <span className={styles.indexName}>{item.name}</span>
            <strong>
              {formatIndianNumber(item.price, "N/A")}{" "}
              <em
                className={
                  item.changePercent === null
                    ? styles.neutral
                    : item.changePercent >= 0
                      ? styles.positive
                      : styles.negative
                }
              >
                {formatPercent(item.changePercent, "N/A")}
              </em>
            </strong>
          </span>
        ))}
      </div>
      <Link href="/markets">
        Open Markets <span>→</span>
      </Link>
    </div>
  );
}
