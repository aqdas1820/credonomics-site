import type { DataAvailability } from "../../src/domain/financial-data";
import { availabilityLabels } from "../../src/domain/freshness";
import { formatDataAsOf } from "../../src/lib/financial-format";
import styles from "./financial-data-state.module.css";

type Props = {
  availability: DataAvailability;
  asOf?: string | null;
  message?: string;
  onRetry?: () => void;
};

export function FinancialDataState({ availability, asOf, message, onRetry }: Props) {
  return (
    <aside className={`${styles.state} ${styles[availability]}`} role={availability === "unavailable" ? "alert" : "status"}>
      <span className={styles.badge}>{availabilityLabels[availability]}</span>
      <span>{message ?? (asOf ? formatDataAsOf(asOf) : "Financial data is currently unavailable")}</span>
      {onRetry ? <button type="button" onClick={onRetry}>Retry</button> : null}
    </aside>
  );
}

export function FinancialLoadingState({ label = "Loading financial data…" }: { label?: string }) {
  return <div className={styles.loading} role="status" aria-live="polite"><i aria-hidden="true" />{label}</div>;
}

export function FinancialEmptyState({ title = "No data", message }: { title?: string; message: string }) {
  return <div className={styles.empty}><strong>{title}</strong><span>{message}</span></div>;
}
