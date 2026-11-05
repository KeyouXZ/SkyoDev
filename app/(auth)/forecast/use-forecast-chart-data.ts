"use client";

import { useMemo } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { ForecastResponse, Metric, SaleRecord } from "./types";

export interface ChartPoint {
  date: string;
  label: string;
  actual: number | null;
  forecast: number | null;
}

export function useForecastChartData(
  sales: SaleRecord[],
  forecastData: ForecastResponse | undefined,
  horizon: number,
  metric: Metric,
): ChartPoint[] {
  const { locale } = usePreferences();
  return useMemo(() => {
    const unitsByDay = new Map<string, number>();
    const revenueByDay = new Map<string, number>();
    for (const s of sales) {
      const d = new Date(s.saleDate).toISOString().slice(0, 10);
      unitsByDay.set(d, (unitsByDay.get(d) ?? 0) + s.quantity);
      revenueByDay.set(
        d,
        (revenueByDay.get(d) ?? 0) +
          (s.quantity * (s.product?.price ?? 0)) / 100,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const points: ChartPoint[] = [];

    // Actual: last 14 days.
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const actual =
        metric === "revenue"
          ? (revenueByDay.get(key) ?? 0)
          : (unitsByDay.get(key) ?? 0);
      points.push({
        date: key,
        label: d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
          month: "short",
          day: "numeric",
        }),
        actual: Number(actual.toFixed(1)),
        // Bridge: today's point carries the forecast value too, so the
        // forecast line connects smoothly from the last actual point.
        forecast: i === 0 ? Number(actual.toFixed(1)) : null,
      });
    }

    // Forecast: next `horizon` days (total across products).
    const totals = new Map<string, number>();
    for (const f of forecastData?.forecasts ?? []) {
      for (const p of f.forecast) {
        const v = metric === "revenue" ? p.revenue : p.value;
        totals.set(p.date, (totals.get(p.date) ?? 0) + v);
      }
    }
    for (let i = 1; i <= horizon; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      points.push({
        date: key,
        label: d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
          month: "short",
          day: "numeric",
        }),
        actual: null,
        forecast: Number((totals.get(key) ?? 0).toFixed(1)),
      });
    }

    return points;
  }, [sales, forecastData, horizon, metric, locale]);
}
