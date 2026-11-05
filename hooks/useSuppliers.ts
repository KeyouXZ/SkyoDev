"use client";

import useSWR from "swr";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { Supplier } from "@/app/(auth)/suppliers/types";

/**
 * Shared suppliers data. Uses the full Supplier type (superset of
 * SupplierSummary) so all pages can consume it.
 */
export function useSuppliers() {
  return useSWR<Supplier[]>("/api/suppliers", fetcher, swrOptions);
}
