"use client";

import { TrendingUp } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { HORIZONS, type Metric } from "./types";

interface ForecastControlsProps {
  metric: Metric;
  onMetricChangeAction: (metric: Metric) => void;
  horizon: number;
  onHorizonChangeAction: (horizon: number) => void;
}

export function ForecastControls({
  metric,
  onMetricChangeAction,
  horizon,
  onHorizonChangeAction,
}: ForecastControlsProps) {
  const { t } = usePreferences();
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900">
            {t("forecast.demandForecast")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("forecast.linearRegression")}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto">
        <div className="flex gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
          {(["revenue", "units"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => onMetricChangeAction(m)}
              className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${
                metric === m
                  ? "bg-[#00a2be] text-white shadow-sm"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              }`}
            >
              {t(`forecast.${m}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => onHorizonChangeAction(h)}
              className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                horizon === h
                  ? "bg-[#00a2be] text-white shadow-sm"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              }`}
            >
              {h}d
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
