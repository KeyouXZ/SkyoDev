"use client";

import { useMemo } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { SaleRecord } from "./types";
import type { DayRevenue } from "./sales-chart";

export function useSalesChartData(sales: SaleRecord[], chartDays: number) {
  const { locale } = usePreferences();
  const salesChartData = useMemo<DayRevenue[]>(() => {
    const days: { date: string; day: string; revenue: number }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        day:
          i === 0
            ? locale === "id"
              ? "Hari ini"
              : "Today"
            : chartDays <= 7
              ? d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                  weekday: "short",
                })
              : d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                  month: "short",
                  day: "numeric",
                }),
        revenue: 0,
      });
    }

    for (const sale of sales) {
      const saleDate = new Date(sale.saleDate);
      saleDate.setHours(0, 0, 0, 0);
      const saleDay = saleDate.toISOString().slice(0, 10);
      const entry = days.find((d) => d.date === saleDay);
      if (entry) {
        entry.revenue += (sale.quantity * (sale.product?.price ?? 0)) / 100;
      }
    }

    return days.map((d) => ({
      day: d.day,
      revenue: Number(d.revenue.toFixed(2)),
      label: d.revenue.toFixed(1),
    }));
  }, [sales, chartDays, locale]);

  const yMax = useMemo(() => {
    const max = Math.max(...salesChartData.map((d) => d.revenue), 0);
    return Math.max(Math.ceil(max / 100) * 100, 100);
  }, [salesChartData]);

  return { salesChartData, yMax };
}
