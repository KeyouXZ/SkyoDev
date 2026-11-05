"use client";

import { History, ShoppingBag } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SaleRecord } from "./types";

export type { SaleRecord } from "./types";

export function RecentSales({ sales }: { sales: SaleRecord[] }) {
  const { t, currency, locale } = usePreferences();
  return (
    <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900">
            {t("sell.recentSales")}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("sell.latestTransactions")}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sales.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/50 p-8 text-center text-sm text-gray-400">
            {t("sell.noSales")}
          </div>
        ) : (
          sales.slice(0, 15).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-3.5 py-3 shadow-sm sm:px-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {s.product?.name ?? `Product #${s.product?.id ?? ""}`}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {s.quantity} ×{" "}
                  {formatCurrency(s.product?.price ?? 0, currency)}
                  <span className="mx-1 text-gray-300">·</span>
                  {formatDate(s.saleDate, locale, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-[#00a2be]">
                {formatCurrency(s.quantity * (s.product?.price ?? 0), currency)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
