"use client";

import { AlertTriangle, Box } from "lucide-react";
import { RowActions } from "./row-actions";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";

interface InventoryMobileCardsProps {
  filtered: ProductWithSupplier[];
  loading: boolean;
  onEditAction: (product: ProductWithSupplier) => void;
  onDeleteAction: (product: ProductWithSupplier) => void;
}

export function InventoryMobileCards({
  filtered,
  loading,
  onEditAction,
  onDeleteAction,
}: InventoryMobileCardsProps) {
  const { t, currency } = usePreferences();
  return (
    <div className="space-y-3 sm:hidden">
      {loading ? (
        Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-xl bg-white/70"
            />
          ))
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          {t("inventory.noProducts")}
        </div>
      ) : (
        filtered.map((p) => {
          const isLow = p.stockLevel <= p.reorderPoint;
          return (
            <div
              key={p.id}
              data-testid={`card-product-${p.id}`}
              className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00a2be]/10">
                    <Box className="h-4 w-4 text-[#00a2be]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {p.name}
                    </p>
                    <p className="font-mono text-xs text-gray-500">{p.sku}</p>
                  </div>
                </div>
                <RowActions
                  product={p}
                  testPrefix="button-actions-mobile"
                  onEditAction={onEditAction}
                  onDeleteAction={onDeleteAction}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">{t("inventory.stock")}:</span>
                  <span
                    className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}
                  >
                    {p.stockLevel}
                  </span>
                  {isLow && <AlertTriangle className="h-3 w-3 text-red-500" />}
                </div>
                <div>
                  <span className="text-gray-500">
                    {t("inventory.price")}:{" "}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(p.price, currency)}
                  </span>
                </div>
                {p.category && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-gray-500">
                    {p.category}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
