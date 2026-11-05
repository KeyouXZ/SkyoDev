"use client";

import { Search } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";

interface ProductSearchProps {
  search: string;
  onSearchChangeAction: (value: string) => void;
  results: ProductWithSupplier[];
  onAddItemAction: (product: ProductWithSupplier) => void;
}

export function ProductSearch({
  search,
  onSearchChangeAction,
  results,
  onAddItemAction,
}: ProductSearchProps) {
  const { t, currency } = usePreferences();
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        placeholder={t("purchaseOrders.searchProducts")}
        value={search}
        onChange={(e) => onSearchChangeAction(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-xs outline-none placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
      />
      {search.trim() && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => onAddItemAction(p)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {p.name}
                </p>
                <p className="font-mono text-xs text-gray-500">{p.sku}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-900">
                {formatCurrency(p.cost, currency)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
