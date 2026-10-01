import React from "react";
import type { MarketQuote, CorporateAction } from "../../../../src/domain/equity/types";
import type { CompanyFinancials } from "../../../../src/domain/equity/financial-intelligence";
import { formatPercent } from "../../../../src/lib/financial-format";
import styles from "./financial-intelligence.module.css";
import { ChangeIntelligenceService } from "../../../../src/services/research/ChangeIntelligenceService";

type Result<T> = { data: T | null };

type Props = {
  quote: Result<MarketQuote> | null;
  financials: Result<CompanyFinancials> | null;
  actions: Result<CorporateAction[]> | null;
};

export default function WhatChanged({ quote, financials, actions }: Props) {
  // Use the new Universal Change Intelligence Engine
  const changes = ChangeIntelligenceService.generateStockChanges(
    "current-stock",
    quote?.data ?? null,
    financials?.data ?? null,
    actions?.data ?? null
  );

  if (changes.length === 0) return null;

  return (
    <section className={styles.section} id="what-changed">
      <header>
        <div>
          <span>Recent factual observations</span>
          <h2>What Changed?</h2>
        </div>
      </header>
      <div className={styles.metrics} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {changes.map((insight, idx) => {
          let positive: boolean | undefined = undefined;
          if (insight.percentageChange !== null) {
            positive = insight.percentageChange > 0;
          }
          
          let title = `${insight.metric} ${positive ? "Increased" : positive === false ? "Decreased" : "Changed"}`;
          if (insight.category === "corporate_action") {
            title = `Recent ${insight.metric}`;
          }

          let description = "";
          if (insight.percentageChange !== null && insight.currentPeriod && insight.previousPeriod) {
            description = `${insight.metric} ${positive ? "increased" : "decreased"} by ${formatPercent(Math.abs(insight.percentageChange))} in ${insight.currentPeriod} compared to ${insight.previousPeriod}.`;
          } else if (insight.absoluteChange !== null && insight.category === "price") {
            description = `Stock price has moved by ${formatPercent(Math.abs(insight.percentageChange!))} during the current/last session.`;
          } else if (insight.category === "corporate_action") {
            description = `${insight.currentValue} (Ex-Date: ${insight.eventDate})`;
          } else if (insight.percentageChange !== null && insight.category === "shareholding") {
            description = `${insight.metric} ${positive ? "increased" : "decreased"} by ${formatPercent(Math.abs(insight.percentageChange))} in ${insight.currentPeriod}.`;
          }

          return (
            <div key={idx} style={{ padding: "1rem", border: "1px solid var(--border-color, #eaeaea)", borderRadius: "8px", borderLeft: `4px solid ${positive ? "var(--color-positive, #008a00)" : positive === false ? "var(--color-negative, #d92121)" : "#666"}` }}>
              <b style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-color, #111)" }}>{title}</b>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary, #666)", lineHeight: "1.4" }}>{description}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
