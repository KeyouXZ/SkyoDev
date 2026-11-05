"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars, convertCurrency } from "@/lib/format";

export interface DayRevenue {
  day: string;
  revenue: number;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPointLabel = (props: any) => {
  const { x, y, value, currency } = props;
  if (value === undefined || value === null) return null;
  const formatted = new Intl.NumberFormat(
    currency === "IDR" ? "id-ID" : "en-US",
    { notation: "compact", maximumFractionDigits: 1 },
  ).format(convertCurrency(Number(value), currency));
  return (
    <text
      x={x}
      y={y - 10}
      fill="#64748b"
      fontSize={10.5}
      fontWeight={500}
      textAnchor="middle"
      className="select-none"
    >
      {formatted}
    </text>
  );
};

export function SalesChart({
  data,
  yMax,
  mounted,
  days,
  onDaysChangeAction,
}: {
  data: DayRevenue[];
  yMax: number;
  mounted: boolean;
  days: number;
  onDaysChangeAction: (days: number) => void;
}) {
  const { t, currency } = usePreferences();
  const ranges = [7, 14, 30];
  return (
    <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs lg:col-span-8 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900">
            {t("dashboard.salesOverview")}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("dashboard.lastDaysRevenue", { days })}
          </p>
        </div>
        <div className="flex gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onDaysChangeAction(r)}
              className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                days === r
                  ? "bg-[#00a2be] text-white shadow-sm"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="h-64 w-full sm:h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 22, right: 24, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11.5 }}
                  dy={6}
                />
                <YAxis
                  domain={[0, yMax]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat(
                      currency === "IDR" ? "id-ID" : "en-US",
                      { notation: "compact", maximumFractionDigits: 1 },
                    ).format(convertCurrency(v, currency))
                  }
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [
                    formatDollars(Number(val ?? 0), currency),
                    t("forecast.revenue"),
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5f5bf6"
                  strokeWidth={2.2}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#5f5bf6",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#5f5bf6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  label={<CustomPointLabel currency={currency} />}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              {t("common.loading")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
