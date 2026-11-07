"use client";

import { AlertTriangle } from "lucide-react";
import { StatCard } from "./stat-card";
import { RotatingIndicator } from "./rotating-indicator";
import { usePreferences } from "@/context/PreferencesContext";
import type { DashboardStats } from "./types";

export function LowStockCard({
  stats,
  loading,
  animatedLowStock,
}: {
  stats: DashboardStats;
  loading: boolean;
  animatedLowStock: number;
}) {
  const { t } = usePreferences();
  return (
    <StatCard
      title={t("dashboard.lowStockAlerts")}
      icon={AlertTriangle}
      iconClassName="text-[#ef4444]"
      value={loading ? "—" : String(Math.round(animatedLowStock))}
      footer={
        loading ? (
          <span className="text-gray-500">{t("common.loading")}</span>
        ) : stats.lowStock > 0 ? (
          <RotatingIndicator
            items={[
              <span
                key="critical"
                className="block truncate font-medium text-red-600"
              >
                {stats.criticalProduct?.name ?? ""}
              </span>,
              ...(stats.outOfStock > 0
                ? [
                    <span
                      key="oos"
                      className="text-[11px] font-semibold text-red-600"
                    >
                      {stats.outOfStock} {t("dashboard.outOfStock")}
                    </span>,
                  ]
                : []),
            ]}
          />
        ) : (
          <span className="font-semibold leading-tight text-emerald-500">
            {t("dashboard.allStocked")}
          </span>
        )
      }
    />
  );
}
