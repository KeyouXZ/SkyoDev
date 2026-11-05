"use client";

import { Box, ShoppingCart, AlertTriangle, DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";
import { RotatingIndicator } from "./rotating-indicator";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars } from "@/lib/format";
import type { DashboardStats } from "./types";

interface StatCardsProps {
  stats: DashboardStats;
  loading: boolean;
  animatedProducts: number;
  animatedLowStock: number;
  animatedPending: number;
  animatedValue: number;
}

export function StatCards({
  stats,
  loading,
  animatedProducts,
  animatedLowStock,
  animatedPending,
  animatedValue,
}: StatCardsProps) {
  const { t, currency } = usePreferences();

  return (
    <div className="my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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
    </div>
  );
}
