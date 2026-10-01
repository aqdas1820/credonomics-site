import React from "react";
import type { CorporateAction } from "../../../../src/domain/equity/types";
import { formatINR as formatCurrency } from "../../../../src/lib/financial-format";
import styles from "./financial-intelligence.module.css";
import DataFreshness from "../../../components/DataFreshness";

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; [key: string]: unknown }; error?: { message: string } };

export default function CompanyEvents({ actions }: { actions: Result<CorporateAction[]> | null }) {
  if (!actions || !actions.data || actions.data.length === 0) {
    return null;
  }

  const events = [...actions.data].sort((a, b) => {
    const dateA = a.exDate || a.recordDate || a.eventDate || a.announcementDate || "1970-01-01";
    const dateB = b.exDate || b.recordDate || b.eventDate || b.announcementDate || "1970-01-01";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <section className={styles.section} id="company-events">
      <header>
        <div>
          <span>Chronological event feed</span>
          <h2>Company Events & Actions</h2>
        </div>
      </header>
      <DataFreshness metadata={actions.metadata} />
      <div className={styles.tableWrap} style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Announcement Date</th>
              <th>Record Date</th>
              <th>Ex-Date</th>
              <th>Event Date</th>
              <th>Reporting Period</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 15).map((event, idx) => (
              <tr key={idx}>
                <th style={{ textTransform: "capitalize" }}>{event.type.replace('_', ' ')}</th>
                <td>{event.description}{event.amount !== null ? ` (${formatCurrency(event.amount)})` : event.ratio ? ` (${event.ratio})` : ""}</td>
                <td>{event.announcementDate ?? "—"}</td>
                <td>{event.recordDate ?? "—"}</td>
                <td>{event.exDate ?? "—"}</td>
                <td>{event.eventDate ?? "—"}</td>
                <td>{event.reportingPeriod ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
