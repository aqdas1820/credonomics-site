"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { IndianEquityIdentity, HistoricalRange } from "../../../../src/domain/equity/types";
import { getIndianMarketSession } from "../../../../src/domain/market/session";
import styles from "./stock-detail.module.css";
import StockTrackerActions from "../../../components/StockTrackerActions";
import FinancialIntelligence from "./FinancialIntelligence";

import { useMarketData } from "./useMarketData";
import { useHistoricalData } from "./useHistoricalData";
import StockHeader from "./StockHeader";
import StockStats from "./StockStats";

const InteractiveChart = dynamic(() => import("./InteractiveChart"), { ssr: false, loading: () => <p>Loading interactive chart...</p> });
const ranges: HistoricalRange[] = ["1m", "5m", "15m", "1h", "1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y"];

export default function StockDetailClient({ stock }: { stock: IndianEquityIdentity }) {
  const isBank = /bank/i.test(`${stock.companyName} ${stock.sector ?? ""} ${stock.industry ?? ""}`);
  
  const [range, setRange] = useState<HistoricalRange>("1D");
  const [marketSession, setMarketSession] = useState(() => getIndianMarketSession());

  useEffect(() => {
    const update = () => setMarketSession(getIndianMarketSession());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const { quote, fundamentals, shareholding, actions, financials } = useMarketData(stock.instrumentKey);
  const { history, points, isIntraday } = useHistoricalData(stock.instrumentKey, range);

  const display52WHigh = quote?.data?.fiftyTwoWeekHigh ?? null;
  const display52WLow = quote?.data?.fiftyTwoWeekLow ?? null;

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <StockHeader stock={stock} quote={quote} marketSession={marketSession} />
      
      <StockTrackerActions stock={{ instrumentKey: stock.instrumentKey, symbol: stock.symbol, exchange: stock.exchange, companyName: stock.companyName }} />

      <div className={styles.brokerLayout}>
        {/* MAIN CHART AREA */}
        <div className={styles.mainContent}>
          <section className={styles.chartCard} id="chart">
            <div className={styles.chartControls}>
              <div className={styles.range}>
                {ranges.map(item => (
                  <button key={item} className={item === range ? styles.selected : ""} onClick={() => setRange(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.chartArea}>
              {!history ? (
                <div className={styles.chartLoading}>Loading price history…</div>
              ) : points.length ? (
                <>
                  {history.metadata.session === "previous" ? <p className={styles.notice}>Previous trading session · {history.metadata.sessionDate}</p> : null}
                  <InteractiveChart points={points} isIntraday={isIntraday} />
                </>
              ) : (
                <p className={styles.notice}>{history.error ? "Chart data is unavailable for this interval." : "No trading-session data is available yet."}</p>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR FOR STATS */}
        <StockStats 
          quote={quote} 
          fundamentals={fundamentals} 
          shareholding={shareholding} 
          actions={actions} 
          isBank={isBank} 
          display52WHigh={display52WHigh} 
          display52WLow={display52WLow} 
        />
      </div>
      
      {financials?.data ? (
        <FinancialIntelligence data={financials.data} />
      ) : financials ? (
        <section className={styles.financialEmpty}>Financial data unavailable for this company.</section>
      ) : (
        <section className={styles.financialEmpty}>Loading financial statements…</section>
      )}
    </main>
  );
}
