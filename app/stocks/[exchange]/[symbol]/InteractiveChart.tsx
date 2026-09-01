"use client";
import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, Time, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import type { HistoricalPrice } from "../../../../src/domain/equity/types";
import { formatINR, formatIndianNumber, formatPercent } from "../../../../src/lib/financial-format";
import styles from "./stock-detail.module.css";

interface InteractiveChartProps {
  points: HistoricalPrice[];
  isIntraday?: boolean;
}

export default function InteractiveChart({ points, isIntraday = false }: InteractiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState<HistoricalPrice | null>(null);
  const [hovered, setHovered] = useState<HistoricalPrice | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const isDark = document.documentElement.dataset.theme === "dark";
    const textColor = isDark ? "#A3A3A3" : "#52525B";
    const backgroundColor = "transparent";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        timeVisible: isIntraday,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
      },
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "", // Overlay on bottom
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart
        bottom: 0,
      },
    });

    const sortedPoints = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // De-duplicate points by time
    const seenTimes = new Set<number>();
    const candleData: Array<{ time: Time; open: number; high: number; low: number; close: number }> = [];
    const volumeData: Array<{ time: Time; value: number; color: string }> = [];
    const timeToPoint = new Map<number | string, HistoricalPrice>();

    sortedPoints.forEach((point) => {
      const d = new Date(point.date);
      const time = isIntraday ? Math.floor(d.getTime() / 1000) as Time : d.toISOString().split("T")[0] as Time;
      const numTime = typeof time === "number" ? time : new Date(time as string).getTime();
      
      if (!seenTimes.has(numTime)) {
        seenTimes.add(numTime);
        candleData.push({
          time,
          open: point.open as number,
          high: point.high as number,
          low: point.low as number,
          close: point.close as number,
        });
        
        const isUp = (point.close as number) >= (point.open as number);
        volumeData.push({
          time,
          value: point.volume as number,
          color: isUp ? "rgba(38, 166, 154, 0.4)" : "rgba(239, 83, 80, 0.4)",
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeToPoint.set(time as any, point);
      }
    });

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    let currentPinned: HistoricalPrice | null = null;

    chart.subscribeCrosshairMove((param) => {
      if (currentPinned) return; // Ignore hover if pinned
      
      if (param.time && param.seriesData.get(candleSeries)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const point = timeToPoint.get(param.time as any);
        if (point) setHovered(point);
      } else {
        setHovered(null);
      }
    });

    chart.subscribeClick((param) => {
      if (!param.time) {
        setPinned(null);
        currentPinned = null;
        return;
      }
      if (currentPinned) {
        // Unpin if already pinned
        setPinned(null);
        currentPinned = null;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const point = timeToPoint.get(param.time as any);
        if (point) {
          setPinned(point);
          currentPinned = point;
        }
      }
    });

    return () => {
      chart.remove();
    };
  }, [points, isIntraday]);

  const activePoint = pinned || hovered;
  const isUp = activePoint && (activePoint.close as number) >= (activePoint.open as number);

  return (
    <div className={styles.chartWrapper}>
      {activePoint && (
        <div className={`${styles.chartTooltip} ${pinned ? styles.chartTooltipPinned : ""}`}>
          <div className={styles.tooltipHeader}>
            {new Date(activePoint.date).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
              ...(isIntraday && { hour: "numeric", minute: "numeric", hour12: true }),
            })}
            {pinned && <span className={styles.pinnedBadge}>Pinned (Click to unpin)</span>}
          </div>
          <div className={styles.tooltipGrid}>
            <div><span>O</span> <strong>{formatINR(activePoint.open, "0")}</strong></div>
            <div><span>H</span> <strong>{formatINR(activePoint.high, "0")}</strong></div>
            <div><span>L</span> <strong>{formatINR(activePoint.low, "0")}</strong></div>
            <div><span>C</span> <strong className={isUp ? styles.upText : styles.downText}>{formatINR(activePoint.close, "0")}</strong></div>
            <div><span>V</span> <strong>{formatIndianNumber(activePoint.volume as number, "0")}</strong></div>
            <div>
              <span>%</span> 
              <strong className={isUp ? styles.upText : styles.downText}>
                {formatPercent(((activePoint.close as number) - (activePoint.open as number)) / (activePoint.open as number) * 100, "0")}
              </strong>
            </div>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className={styles.chartContainer} />
      <div className={styles.attribution}>
        <a href="https://tradingview.com/" target="_blank" rel="noopener noreferrer">
          Powered by TradingView Lightweight Charts
        </a>
      </div>
    </div>
  );
}
