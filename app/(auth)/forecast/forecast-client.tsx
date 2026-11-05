"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { PageShell } from "@/components/PageShell";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { useMounted } from "@/hooks/useMounted";
import { usePreferences } from "@/context/PreferencesContext";
import { ForecastControls } from "./forecast-controls";
import { ForecastChart } from "./forecast-chart";
import { ReorderList } from "./reorder-list";
import { useForecastChartData } from "./use-forecast-chart-data";
import type { ForecastResponse, Metric, SaleRecord } from "./types";

export default function ForecastPageClient() {
  const { t } = usePreferences();
  const [horizon, setHorizon] = useState(30);
  const [metric, setMetric] = useState<Metric>("revenue");
  const mounted = useMounted();

  const { data: forecastData, isLoading: forecastLoading } =
    useSWR<ForecastResponse>(
      `/api/forecast?horizon=${horizon}`,
      fetcher,
      swrOptions,
    );
  const { data: sales = [] } = useSWR<SaleRecord[]>(
    "/api/sales?limit=500",
    fetcher,
    swrOptions,
  );

  const chartData = useForecastChartData(sales, forecastData, horizon, metric);

  const reorderList = useMemo(
    () =>
      (forecastData?.forecasts ?? [])
        .filter((f) => f.needsReorder)
        .sort((a, b) => b.suggestedOrder - a.suggestedOrder),
    [forecastData],
  );

  const totalForecast = useMemo(() => {
    const forecasts = forecastData?.forecasts ?? [];
    return metric === "revenue"
      ? forecasts.reduce((sum, f) => sum + f.totalRevenue, 0)
      : forecasts.reduce((sum, f) => sum + f.totalDemand, 0);
  }, [forecastData, metric]);

  return (
    <PageShell title={t("forecast.title")}>
      <ForecastControls
        metric={metric}
        onMetricChangeAction={setMetric}
        horizon={horizon}
        onHorizonChangeAction={setHorizon}
      />

      <ForecastChart
        chartData={chartData}
        mounted={mounted}
        metric={metric}
        totalForecast={totalForecast}
      />

      <ReorderList reorderList={reorderList} loading={forecastLoading} />
    </PageShell>
  );
}
