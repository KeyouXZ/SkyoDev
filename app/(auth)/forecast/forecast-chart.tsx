"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartPoint } from "./use-forecast-chart-data";
import type { Metric } from "./types";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars, formatNumber, convertCurrency } from "@/lib/format";

interface ForecastChartProps {
  chartData: ChartPoint[];
  mounted: boolean;
  metric: Metric;
  totalForecast: number;
}

export function ForecastChart({
  chartData,
  mounted,
  metric,
  totalForecast,
}: ForecastChartProps) {
  const { t, currency, locale } = usePreferences();
  return (
    <div className="mt-5 rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-gray-900">
            {t("forecast.actualVsForecast")}
          </h4>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("forecast.totalDaily", { metric: t(`forecast.${metric}`) })}
          </p>
        </div>
        <span className="rounded-full bg-[#00a2be]/15 px-3 py-1 text-xs font-semibold text-[#00a2be]">
          {metric === "revenue"
            ? formatDollars(totalForecast, currency, {
                maximumFractionDigits: 0,
              })
            : `${formatNumber(Math.round(totalForecast), locale)} ${t("forecast.units")}`}{" "}
          {t("forecast.forecast")}
        </span>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="h-64 w-full sm:h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  minTickGap={24}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v: number) => {
                    if (metric === "revenue") {
                      const converted = convertCurrency(v, currency);
                      return new Intl.NumberFormat(
                        currency === "IDR" ? "id-ID" : "en-US",
                        {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        },
                      ).format(converted);
                    }
                    return formatNumber(Math.round(v), locale);
                  }}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [
                    metric === "revenue"
                      ? formatDollars(Number(val ?? 0), currency)
                      : `${formatNumber(Number(val ?? 0), locale)} ${t("forecast.units")}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name={t("forecast.actual")}
                  stroke="#00a2be"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name={t("forecast.forecastLabel")}
                  stroke="#f97316"
                  strokeWidth={2.2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              {t("forecast.loadingForecast")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
