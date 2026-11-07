"use client";

import { DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";
import { RotatingIndicator } from "./rotating-indicator";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars } from "@/lib/format";
import type { DashboardStats } from "./types";

export function InventoryValueCard({
  stats,
  loading,
  animatedValue,
}: {
  stats: DashboardStats;
  loading: boolean;
  animatedValue: number;
}) {
  const { t, currency } = usePreferences();
  return (
    <StatCard
      title={t("dashboard.inventoryValue")}
      icon={DollarSign}
      iconClassName="text-[#10b981]"
      value={
        loading
          ? "—"
          : formatDollars(animatedValue, currency, {
              minimumFractionDigits: currency === "IDR" ? 0 : 2,
              maximumFractionDigits: currency === "IDR" ? 0 : 2,
            })
      }
      footer={
        loading ? (
          <span className="text-gray-500">{t("common.loading")}</span>
        ) : (
          <RotatingIndicator
            items={[
              <span
                key="retail"
                className="text-[11px] font-semibold text-slate-600"
              >
                {t("dashboard.retail")}{" "}
                {formatDollars(stats.retailValue, currency, {
                  maximumFractionDigits: 0,
                })}
              </span>,
              <span
                key="margin"
                className="text-[11px] font-semibold text-emerald-600"
              >
                {stats.retailValue > 0
                  ? `${Math.round(
                      ((stats.retailValue - stats.inventoryValue) /
                        stats.retailValue) *
                        100,
                    )}% ${t("dashboard.margin")}`
                  : `0% ${t("dashboard.margin")}`}
              </span>,
              <span key="sales" className="text-[11px] text-gray-500">
                {t("dashboard.sales")}{" "}
                {formatDollars(stats.salesThisMonth, currency, {
                  maximumFractionDigits: 0,
                })}{" "}
                <span
                  className={`font-semibold ${
                    stats.salesChangePct >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {stats.salesChangePct >= 0 ? "▲" : "▼"}
                  {Math.abs(Math.round(stats.salesChangePct))}%{" "}
                  {t("dashboard.vsLastMonth")}
                </span>
              </span>,
            ]}
          />
        )
      }
    />
  );
}
