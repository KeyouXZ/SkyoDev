"use client";

import { ShoppingCart } from "lucide-react";
import { StatCard } from "./stat-card";
import { RotatingIndicator } from "./rotating-indicator";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars } from "@/lib/format";
import type { DashboardStats } from "./types";

export function PendingOrdersCard({
  stats,
  loading,
  animatedPending,
}: {
  stats: DashboardStats;
  loading: boolean;
  animatedPending: number;
}) {
  const { t, currency } = usePreferences();
  return (
    <StatCard
      title={t("dashboard.pendingOrders")}
      icon={ShoppingCart}
      iconClassName="text-gray-800"
      value={loading ? "—" : String(Math.round(animatedPending))}
      footer={
        loading ? (
          <span className="text-gray-500">{t("common.loading")}</span>
        ) : (
          <RotatingIndicator
            items={[
              <span
                key="draft"
                className="text-[11px] font-semibold text-amber-600"
              >
                {stats.draft} {t("dashboard.draft")}
              </span>,
              <span
                key="sent"
                className="text-[11px] font-semibold text-teal-600"
              >
                {stats.sent} {t("dashboard.sent")}
              </span>,
              <span key="value" className="font-semibold text-gray-700">
                {formatDollars(stats.orderValue, currency, {
                  maximumFractionDigits: 0,
                })}
              </span>,
            ]}
          />
        )
      }
    />
  );
}
