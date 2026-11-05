"use client";

import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";

interface ProductSearchResultsProps {
  productsLoading: boolean;
  results: ProductWithSupplier[];
  onSelectAction: (product: ProductWithSupplier) => void;
}

export function ProductSearchResults({
  productsLoading,
  results,
  onSelectAction,
}: ProductSearchResultsProps) {
  const { t, currency } = usePreferences();
  return (
    <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
      {productsLoading ? (
        <p className="px-4 py-3 text-sm text-gray-400">
          {t("sell.loadingProducts")}
        </p>
      ) : results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-400">{t("sell.noMatch")}</p>
      ) : (
        results.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectAction(p)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {p.name}
              </p>
              <p className="font-mono text-xs text-gray-500">{p.sku}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(p.price, currency)}
              </p>
              <p
                className={`text-xs ${
                  p.stockLevel <= p.reorderPoint
                    ? "font-semibold text-red-500"
                    : "text-gray-500"
                }`}
              >
                {p.stockLevel} {t("sell.inStock")}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
