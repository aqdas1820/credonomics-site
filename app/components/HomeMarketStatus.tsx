"use client";
import { useEffect, useState } from "react";
import DataFreshness from "./DataFreshness";
import type { FinancialDataMetadata } from "../../src/domain/financial-data";
import Link from "next/link";
import styles from "../home-investment.module.css";

export default function HomeMarketStatus() {
  const [result, setResult] = useState<{ metadata?: FinancialDataMetadata, error?: { message?: string } } | null>(null);

  useEffect(() => {
    fetch("/api/markets/overview")
      .then(async response => setResult(await response.json()))
      .catch(() => setResult({ error: { message: "Market data temporarily unavailable." } }));
  }, []);

  const isAvailable = result && !result.error && result.metadata?.availability !== "unavailable" && result.metadata?.asOf;


  return (
    <div className={styles.marketStatus} aria-label="Market data status">
      <div>
        <span>Market status</span>
        {result?.metadata ? <DataFreshness metadata={result.metadata} hasData={!result.error} /> : <strong>Market data temporarily unavailable</strong>}
      </div>
      <p>{isAvailable ? "Verified market values and indices are available." : "Verified market values will appear here when the connected provider is available."}</p>
      <Link href="/markets">Open Markets <span>→</span></Link>
    </div>
  );
}
