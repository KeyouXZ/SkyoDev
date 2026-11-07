"use client";

import { Box } from "lucide-react";
import { StatCard } from "./stat-card";
import { RotatingIndicator } from "./rotating-indicator";
import { usePreferences } from "@/context/PreferencesContext";
import type { DashboardStats } from "./types";

export function TotalProductsCard({
  stats,
  loading,
  animatedProducts,
}: {
  stats: DashboardStats;
  loading: boolean;
  animatedProducts: number;
}) {
  const { t } = usePreferences();
  return (
    <StatCard
      title={t("dashboard.totalProducts")}
      icon={Box}
      iconClassName="text-[#2563eb]"
      value={loading ? "—" : String(Math.round(animatedProducts))}
      footer={
        loading ? (
          <span className="text-gray-500">{t("common.loading")}</span>
        ) : (
          <RotatingIndicator
            items={[
              <span
                key="health"
                className="text-[11px] font-semibold text-emerald-600"
              >
                {stats.stockHealth}% {t("dashboard.healthy")}
              </span>,
              ...(stats.productsThisMonth > 0
                ? [
                    <span
                      key="new"
                      className="text-[11px] font-semibold text-teal-600"
                    >
                      +{stats.productsThisMonth} {t("dashboard.new")}
                    </span>,
                  ]
                : []),
              <span key="units" className="text-gray-500">
                {stats.totalUnits} {t("dashboard.unitsInStock")}
              </span>,
            ]}
          />
        )
      }
    />
  );
}
