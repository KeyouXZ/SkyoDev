"use client";

import { useMemo } from "react";
import type { ProductWithSupplier } from "@/types/inventory";
import type { DashboardStats, PurchaseOrder, SaleRecord } from "./types";

export function useDashboardStats(
  products: ProductWithSupplier[],
  orders: PurchaseOrder[],
  sales: SaleRecord[],
): DashboardStats {
  return useMemo(() => {
    const lowStockProducts = products.filter(
      (p) => p.stockLevel <= p.reorderPoint,
    );
    const lowStock = lowStockProducts.length;
    const outOfStock = products.filter((p) => p.stockLevel === 0).length;
    const pending = orders.filter((o) => o.status !== "received").length;
    const draft = orders.filter((o) => o.status === "draft").length;
    const sent = orders.filter((o) => o.status === "sent").length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.stockLevel * p.cost,
      0,
    );
    const retailValue = products.reduce(
      (sum, p) => sum + p.stockLevel * p.price,
      0,
    );
    const totalUnits = products.reduce((sum, p) => sum + p.stockLevel, 0);
    const healthy = products.length > 0 ? products.length - lowStock : 0;
    const stockHealth =
      products.length > 0 ? Math.round((healthy / products.length) * 100) : 100;
    const criticalProduct = lowStockProducts
      .slice()
      .sort(
        (a, b) =>
          a.stockLevel / Math.max(a.reorderPoint, 1) -
          b.stockLevel / Math.max(b.reorderPoint, 1),
      )[0];
    const orderValue = orders
      .filter((o) => o.status !== "received")
      .reduce(
        (sum, o) =>
          sum +
          o.items.reduce((s, i) => s + i.quantity * (i.product?.cost ?? 0), 0),
        0,
      );

    // This-month activity (for comparison indicators).
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const productsThisMonth = products.filter(
      (p) => p.createdAt && new Date(p.createdAt) >= thisMonthStart,
    ).length;
    const ordersThisMonth = orders.filter(
      (o) => new Date(o.createdAt) >= thisMonthStart,
    ).length;

    // Sales revenue: this month vs last month.
    let salesThisMonth = 0;
    let salesLastMonth = 0;
    for (const s of sales) {
      const d = new Date(s.saleDate);
      const rev = (s.quantity * (s.product?.price ?? 0)) / 100;
      if (d >= thisMonthStart) salesThisMonth += rev;
      else if (d >= lastMonthStart) salesLastMonth += rev;
    }
    const salesChangePct =
      salesLastMonth > 0
        ? ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100
        : salesThisMonth > 0
          ? 100
          : 0;

    return {
      totalProducts: products.length,
      lowStock,
      outOfStock,
      pending,
      draft,
      sent,
      inventoryValue: inventoryValue / 100,
      retailValue: retailValue / 100,
      totalUnits,
      stockHealth,
      criticalProduct,
      orderValue: orderValue / 100,
      productsThisMonth,
      ordersThisMonth,
      salesThisMonth,
      salesChangePct,
    };
  }, [products, orders, sales]);
}
