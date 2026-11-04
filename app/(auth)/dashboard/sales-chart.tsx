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

export interface DayRevenue {
  day: string;
  revenue: number;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPointLabel = (props: any) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
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
      {value}
    </text>
  );
};

export function SalesChart({
  data,
  yMax,
  mounted,
}: {
  data: DayRevenue[];
  yMax: number;
  mounted: boolean;
}) {
  return (
    <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs lg:col-span-8 sm:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900">
          Sales Overview
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">Last 7 days revenue</p>
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
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [
                    `$${Number(val ?? 0).toFixed(2)}`,
                    "Revenue",
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
                  label={<CustomPointLabel />}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              Loading chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
