"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PageShell } from "@/components/PageShell";
import type { CurrentUser } from "@/auth/currentUser";
import { useUser } from "@/context/UserContext";
import { usePreferences } from "@/context/PreferencesContext";
import type { ProductWithSupplier } from "@/types/inventory";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { useCountUp } from "@/hooks/useCountUp";
import { useMounted } from "@/hooks/useMounted";
import { SalesChart } from "./sales-chart";
import { QuickActions } from "./quick-actions";
import { StatCards } from "./stat-cards";
import { useDashboardStats } from "./use-dashboard-stats";
import { useSalesChartData } from "./use-sales-chart-data";
import type { PurchaseOrder, SaleRecord } from "./types";

interface Props {
  user?: CurrentUser;
}

export default function NiragaDashboard({ user: propUser }: Props = {}) {
  const contextUser = useUser();
  const { t } = usePreferences();
  const user = propUser ?? contextUser;
  const mounted = useMounted();
  const router = useRouter();
  const [chartDays, setChartDays] = useState(7);

  const { data: products = [], isLoading: productsLoading } = useSWR<
    ProductWithSupplier[]
  >("/api/products", fetcher, swrOptions);
  const { data: orders = [] } = useSWR<PurchaseOrder[]>(
    "/api/purchase-orders",
    fetcher,
    swrOptions,
  );
  const { data: sales = [] } = useSWR<SaleRecord[]>(
    "/api/sales?limit=500",
    fetcher,
    swrOptions,
  );

  const loading = productsLoading;
  const stats = useDashboardStats(products, orders, sales);
  const { salesChartData, yMax } = useSalesChartData(sales, chartDays);

  const animatedProducts = useCountUp(stats.totalProducts);
  const animatedLowStock = useCountUp(stats.lowStock);
  const animatedPending = useCountUp(stats.pending);
  const animatedValue = useCountUp(stats.inventoryValue);

  return (
    <PageShell title={t("dashboard.title")} user={user}>
      <StatCards
        stats={stats}
        loading={loading}
        animatedProducts={animatedProducts}
        animatedLowStock={animatedLowStock}
        animatedPending={animatedPending}
        animatedValue={animatedValue}
      />

      {/* Bottom Grid */}
      <div className="grid flex-1 grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <SalesChart
          data={salesChartData}
          yMax={yMax}
          mounted={mounted}
          days={chartDays}
          onDaysChangeAction={setChartDays}
        />
        <QuickActions onNavigateAction={(href) => router.push(href)} />
      </div>
    </PageShell>
  );
}
