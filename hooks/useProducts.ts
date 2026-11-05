"use client";

import useSWR from "swr";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { ProductWithSupplier } from "@/types/inventory";

/**
 * Shared products data. All pages use the same SWR key so the cache
 * is shared across navigation (no refetch within dedupingInterval).
 */
export function useProducts() {
  return useSWR<ProductWithSupplier[]>("/api/products", fetcher, swrOptions);
}
