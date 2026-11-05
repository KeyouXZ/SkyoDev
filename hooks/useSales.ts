"use client";

import useSWR from "swr";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { SaleRecord } from "@/app/(auth)/sell/types";

/**
 * Shared sales data. Single key (limit=500) so all pages share the cache;
 * pages needing fewer rows (e.g. Sell's recent 30) slice client-side.
 */
export function useSales() {
  return useSWR<SaleRecord[]>("/api/sales?limit=500", fetcher, swrOptions);
}
