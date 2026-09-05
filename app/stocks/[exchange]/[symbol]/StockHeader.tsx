import type { IndianEquityIdentity, MarketQuote } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency, formatPercent } from "../../../../src/lib/financial-format";
import { IndianMarketSession, marketSessionLabel } from "../../../../src/domain/market/session";
import styles from "./stock-detail.module.css";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: "current" | "previous"; sessionDate?: string }; error?: { message: string } };

type Props = {
  stock: IndianEquityIdentity;
  quote: Result<MarketQuote> | null;
  marketSession: IndianMarketSession;
};

export default function StockHeader({ stock, quote, marketSession }: Props) {
  return (
    <header className={styles.brokerHeader}>
      <div className={styles.headerTitle}>
        <h1>{stock.companyName}</h1>
        <span className={styles.exchangeBadge}>{stock.symbol} • {stock.exchange}</span>
      </div>
      {quote?.data ? (
        <div className={styles.headerPriceData}>
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatCurrency(quote.data.price, "N/A")}</span>
            {quote.data.change !== null ? (
              <span className={quote.data.change >= 0 ? styles.up : styles.down}>
                {quote.data.change > 0 ? "+" : ""}{formatCurrency(quote.data.change, "N/A")} ({formatPercent(quote.data.changePercent, "N/A")})
              </span>
            ) : (
              <span className={styles.notice}>Change N/A</span>
            )}
          </div>
          <small className={styles.timestamp}>
            {marketSession === "OPEN" ? <span className={styles.liveIndicator}></span> : null}
            {marketSessionLabel(marketSession)} · {quote.metadata.asOf ? new Date(quote.metadata.asOf).toLocaleString("en-IN") : "Timestamp unavailable"}
          </small>
        </div>
      ) : quote ? (
        <p className={styles.notice}>{quote.error?.message ?? "Market data temporarily unavailable."}</p>
      ) : (
        <div className={styles.headerPriceData}><p>Loading market quote…</p></div>
      )}
    </header>
  );
}
