import type { CompanyFundamentals, CorporateAction, MarketQuote, Shareholding } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency, formatIndianNumber as formatNumber, formatPercent } from "../../../../src/lib/financial-format";
import styles from "./stock-detail.module.css";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };

type Props = {
  quote: Result<MarketQuote> | null;
  fundamentals: Result<CompanyFundamentals> | null;
  shareholding: Result<Shareholding> | null;
  actions: Result<CorporateAction[]> | null;
  isBank: boolean;
  display52WHigh: number | null;
  display52WLow: number | null;
};

export default function StockStats({ quote, fundamentals, shareholding, actions, isBank, display52WHigh, display52WLow }: Props) {
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
        {fundamentals?.data ? (
          <div className={styles.brokerGrid}>
            {[
              ["P/E Ratio", fundamentals.data.pe],
              ["P/B Ratio", fundamentals.data.pb],
              ["ROE", fundamentals.data.roe],
              ["ROCE", fundamentals.data.roce],
              ["ROA", fundamentals.data.roa],
              ["EV/EBITDA", fundamentals.data.evEbitda]
            ].filter(([label]) => !isBank || label !== "EV/EBITDA").map(([label, value]) => (
              <div key={String(label)} className={styles.gridItem}>
                <span className={styles.gridLabel}>{label}</span>
                <strong className={styles.gridValue}>{formatNumber(value as number | null, "N/A")}</strong>
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
        {shareholding?.data ? (
          <div className={styles.brokerGrid}>
            {[
              ["Promoters", shareholding.data.promoterHolding],
              ["FII", shareholding.data.fiiHolding],
              ["DII", shareholding.data.diiHolding],
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

      {/* CORPORATE ACTIONS */}
      <section className={styles.statsCard} id="corporate-actions">
        <h2>Corporate Actions</h2>
        {actions?.data?.length ? (
          <div className={styles.actionList}>
            {actions.data.slice(0, 10).map((action, index) => (
              <article key={`${action.type}-${action.recordDate}-${index}`} className={styles.actionItem}>
                <strong>{action.type.toUpperCase()}</strong>
                <span>{action.description}</span>
                <small>Announced: {action.announcementDate ?? "N/A"} · Ex-date: {action.exDate ?? "N/A"} · Record: {action.recordDate ?? "N/A"}{action.amount !== null ? ` · ${formatCurrency(action.amount)}` : action.ratio ? ` · ${action.ratio}` : ""}</small>
              </article>
            ))}
          </div>
        ) : actions ? (
          <p className={styles.notice}>{actions.error?.message ?? "No corporate actions returned."}</p>
        ) : (
          <p className={styles.loading}>Loading corporate actions…</p>
        )}
      </section>
    </aside>
  );
}
