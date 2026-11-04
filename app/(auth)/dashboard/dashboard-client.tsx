"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Box, ShoppingCart, AlertTriangle, DollarSign } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import type { CurrentUser } from "@/auth/currentUser";
import { useUser } from "@/context/UserContext";
import type { ProductWithSupplier } from "@/types/inventory";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { useCountUp } from "@/hooks/useCountUp";
import { StatCard } from "./stat-card";
import { SalesChart, type DayRevenue } from "./sales-chart";
import { QuickActions } from "./quick-actions";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

interface PurchaseOrder {
  id: number;
  status: string;
}

interface SaleRecord {
  id: number;
  quantity: number;
  saleDate: string;
  product?: { price: number } | null;
}

interface Props {
  user?: CurrentUser;
}

export default function NiragaDashboard({ user: propUser }: Props = {}) {
  const contextUser = useUser();
  const user = propUser ?? contextUser;
  const mounted = useMounted();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const stats = useMemo(() => {
    const lowStock = products.filter(
      (p) => p.stockLevel <= p.reorderPoint,
    ).length;
    const pending = orders.filter((o) => o.status !== "received").length;
    const draft = orders.filter((o) => o.status === "draft").length;
    const sent = orders.filter((o) => o.status === "sent").length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.stockLevel * p.cost,
      0,
    );
    const totalUnits = products.reduce((sum, p) => sum + p.stockLevel, 0);
    return {
      totalProducts: products.length,
      lowStock,
      pending,
      draft,
      sent,
      inventoryValue: inventoryValue / 100,
      totalUnits,
    };
  }, [products, orders]);

  const salesChartData = useMemo<DayRevenue[]>(() => {
    const days: { date: string; day: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        day:
          i === 0
            ? "Today"
            : d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: 0,
      });
    }

    for (const sale of sales) {
      const saleDay = new Date(sale.saleDate).toISOString().slice(0, 10);
      const entry = days.find((d) => d.date === saleDay);
      if (entry) {
        entry.revenue += (sale.quantity * (sale.product?.price ?? 0)) / 100;
      }
    }

    return days.map((d) => ({
      day: d.day,
      revenue: Number(d.revenue.toFixed(2)),
      label: d.revenue.toFixed(1),
    }));
  }, [sales]);

  const yMax = useMemo(() => {
    const max = Math.max(...salesChartData.map((d) => d.revenue), 0);
    return Math.max(Math.ceil(max / 100) * 100, 100);
  }, [salesChartData]);

  const animatedProducts = useCountUp(stats.totalProducts);
  const animatedLowStock = useCountUp(stats.lowStock);
  const animatedPending = useCountUp(stats.pending);
  const animatedValue = useCountUp(stats.inventoryValue);

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header
            title="Dashboard"
            setSidebarOpen={setSidebarOpen}
            user={user}
          />

          {/* 4 Stat Cards */}
          <div className="my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatCard
              title="Total Products"
              icon={Box}
              iconClassName="text-[#2563eb]"
              value={loading ? "—" : String(Math.round(animatedProducts))}
              footer={
                <span className="text-gray-500">
                  {loading ? "" : `${stats.totalUnits} units in stock`}
                </span>
              }
            />
            <StatCard
              title="Low Stock Alerts"
              icon={AlertTriangle}
              iconClassName="text-[#ef4444]"
              value={loading ? "—" : String(Math.round(animatedLowStock))}
              footer={
                loading ? (
                  <span className="text-gray-500">Loading…</span>
                ) : stats.lowStock > 0 ? (
                  <span className="font-semibold leading-tight text-red-500">
                    Requires attention
                  </span>
                ) : (
                  <span className="font-semibold leading-tight text-emerald-500">
                    All stocked
                  </span>
                )
              }
            />
            <StatCard
              title="Pending Orders"
              icon={ShoppingCart}
              iconClassName="text-gray-800"
              value={loading ? "—" : String(Math.round(animatedPending))}
              footer={
                <span className="text-gray-500">
                  {loading ? "" : `${stats.draft} draft · ${stats.sent} sent`}
                </span>
              }
            />
            <StatCard
              title="Inventory Value"
              icon={DollarSign}
              iconClassName="text-[#10b981]"
              value={
                loading
                  ? "—"
                  : `$ ${animatedValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
              }
              footer={<span className="text-gray-500">at cost</span>}
            />
          </div>

          {/* Bottom Grid */}
          <div className="grid flex-1 grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <SalesChart data={salesChartData} yMax={yMax} mounted={mounted} />
            <QuickActions onNavigateAction={(href) => router.push(href)} />
          </div>
        </main>
      </div>
    </div>
  );
}
