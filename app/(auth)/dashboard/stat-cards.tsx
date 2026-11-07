"use client";

import { TotalProductsCard } from "./total-products-card";
import { LowStockCard } from "./low-stock-card";
import { PendingOrdersCard } from "./pending-orders-card";
import { InventoryValueCard } from "./inventory-value-card";
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
  return (
    <div className="my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <TotalProductsCard
        stats={stats}
        loading={loading}
        animatedProducts={animatedProducts}
      />
      <LowStockCard
        stats={stats}
        loading={loading}
        animatedLowStock={animatedLowStock}
      />
      <PendingOrdersCard
        stats={stats}
        loading={loading}
        animatedPending={animatedPending}
      />
      <InventoryValueCard
        stats={stats}
        loading={loading}
        animatedValue={animatedValue}
      />
    </div>
  );
}
