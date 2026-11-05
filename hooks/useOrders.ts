"use client";

import useSWR from "swr";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { PurchaseOrder } from "@/app/(auth)/purchase-orders/types";

/**
 * Shared purchase orders data. Uses the full PurchaseOrder type;
 * dashboard only accesses a subset (id/status/createdAt/items).
 */
export function useOrders() {
  return useSWR<PurchaseOrder[]>("/api/purchase-orders", fetcher, swrOptions);
}
