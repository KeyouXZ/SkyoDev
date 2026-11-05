"use client";

import { Search, ShoppingBag } from "lucide-react";
import type { ProductWithSupplier } from "@/types/inventory";
import { ProductSearchResults } from "./product-search-results";
import { SelectedProduct } from "./selected-product";
import { usePreferences } from "@/context/PreferencesContext";

export function RecordSale({
  productsLoading,
  query,
  onQueryChangeAction,
  results,
  selected,
  onSelectAction,
  onClearSelectionAction,
  quantity,
  onQuantityChangeAction,
  total,
  insufficient,
  submitting,
  onRecordAction,
}: {
  productsLoading: boolean;
  query: string;
  onQueryChangeAction: (q: string) => void;
  results: ProductWithSupplier[];
  selected: ProductWithSupplier | null;
  onSelectAction: (p: ProductWithSupplier) => void;
  onClearSelectionAction: () => void;
  quantity: number;
  onQuantityChangeAction: (q: number) => void;
  total: number;
  insufficient: boolean;
  submitting: boolean;
  onRecordAction: () => void;
}) {
  const { t } = usePreferences();
  return (
    <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900">
            {t("sell.recordSale")}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("sell.searchBySku")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder={t("sell.searchPlaceholder")}
          value={query}
          onChange={(e) => onQueryChangeAction(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
        />
        {query.trim() && (
          <ProductSearchResults
            productsLoading={productsLoading}
            results={results}
            onSelectAction={onSelectAction}
          />
        )}
      </div>

      {/* Selected product */}
      {selected ? (
        <SelectedProduct
          selected={selected}
          quantity={quantity}
          total={total}
          insufficient={insufficient}
          submitting={submitting}
          onClearSelectionAction={onClearSelectionAction}
          onQuantityChangeAction={onQuantityChangeAction}
          onRecordAction={onRecordAction}
        />
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/70 bg-white/50 px-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-800">
            {t("sell.noProductSelected")}
          </p>
          <p className="mt-1 max-w-60 text-xs text-gray-500">
            {t("sell.searchToFind")}
          </p>
        </div>
      )}
    </div>
  );
}
