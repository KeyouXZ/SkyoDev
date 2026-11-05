"use client";

import { AlertTriangle, PackageCheck } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars } from "@/lib/format";
import type { ProductForecast } from "./types";

function ReorderCard({ forecast }: { forecast: ProductForecast }) {
  const { t, currency } = usePreferences();
  const f = forecast;
  return (
    <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {f.product.name}
          </p>
          <p className="font-mono text-xs text-gray-500">{f.product.sku}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3 w-3" />
          {t("forecast.order")} {f.suggestedOrder}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 px-1 py-2">
          <p className="text-gray-500">{t("forecast.stock")}</p>
          <p className="mt-0.5 font-bold text-gray-900">
            {f.product.stockLevel}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-1 py-2">
          <p className="text-gray-500">{t("forecast.leadDemand")}</p>
          <p className="mt-0.5 font-bold text-gray-900">
            {Math.round(f.leadTimeDemand)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-1 py-2">
          <p className="text-gray-500">{t("forecast.demand30d")}</p>
          <p className="mt-0.5 font-bold text-gray-900">
            {Math.round(f.totalDemand)}
          </p>
        </div>
        <div className="rounded-lg bg-[#00a2be]/10 px-1 py-2">
          <p className="text-gray-500">{t("forecast.forecastRev")}</p>
          <p className="mt-0.5 font-bold text-[#00a2be]">
            {formatDollars(f.totalRevenue, currency, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ReorderListProps {
  reorderList: ProductForecast[];
  loading: boolean;
}

export function ReorderList({ reorderList, loading }: ReorderListProps) {
  const { t } = usePreferences();
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2 px-1">
        <PackageCheck className="h-5 w-5 text-gray-700" />
        <h3 className="text-xl font-bold tracking-tight text-gray-900">
          {t("forecast.reorderRecommendations")}
        </h3>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/60 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          {t("forecast.generating")}
        </div>
      ) : reorderList.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          {t("forecast.noReorders")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reorderList.map((f) => (
            <ReorderCard key={f.product.id} forecast={f} />
          ))}
        </div>
      )}
    </div>
  );
}
