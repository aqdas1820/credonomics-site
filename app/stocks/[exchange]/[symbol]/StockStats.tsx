import DataFreshness from "../../../components/DataFreshness";
import type { CompanyFundamentals, MarketQuote, Shareholding } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency, formatIndianNumber as formatNumber, formatPercent, formatMarketCap } from "../../../../src/lib/financial-format";
import styles from "./stock-detail.module.css";

type Result<T> = { data: T | null; metadata: { source?: string; availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };

type Props = {
  quote: Result<MarketQuote> | null;
  fundamentals: Result<CompanyFundamentals> | null;
  shareholding: Result<Shareholding> | null;
  isBank: boolean;
  display52WHigh: number | null;
  display52WLow: number | null;
};

export default function StockStats({ quote, fundamentals, shareholding, isBank, display52WHigh, display52WLow }: Props) {
  return (
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
        {fundamentals ? <DataFreshness metadata={fundamentals.metadata} hasData={Boolean(fundamentals.data)} /> : null}
        {fundamentals?.data ? (
          <div className={styles.brokerGrid}>
            {[
              ["Market Cap", fundamentals.data.marketCap ?? quote?.data?.marketCap, "marketCap"],
              ["P/E Ratio", fundamentals.data.pe ?? quote?.data?.pe, "multiple"],
              ["EPS", fundamentals.data.eps ?? quote?.data?.eps, "currency"],
              ["P/B Ratio", fundamentals.data.pb, "multiple"],
              ["ROE", fundamentals.data.roe, "percent"],
              ["ROCE", fundamentals.data.roce, "percent"],
              ["ROA", fundamentals.data.roa, "percent"],
              ["EV/EBITDA", fundamentals.data.evEbitda, "multiple"]
            ].filter(([label]) => !isBank || label !== "EV/EBITDA").map(([label, value, type]) => (
              <div key={String(label)} className={styles.gridItem}>
                <span className={styles.gridLabel}>{label}</span>
                <strong className={styles.gridValue}>{type === "percent" ? formatPercent(value as number | null, "N/A") : type === "currency" ? formatCurrency(value as number | null, "N/A") : type === "marketCap" ? formatMarketCap(value as number | null, "N/A") : formatNumber(value as number | null, "N/A")}</strong>
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
        {shareholding ? <DataFreshness metadata={shareholding.metadata} hasData={Boolean(shareholding.data)} /> : null}
        {shareholding?.data ? (
          <div className={styles.brokerGrid}>
            {[
              ["Promoters", shareholding.data.promoterHolding],
              ["FII", shareholding.data.fiiHolding],
              ["Other DII", shareholding.data.diiHolding],
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

    </aside>
  );
}
