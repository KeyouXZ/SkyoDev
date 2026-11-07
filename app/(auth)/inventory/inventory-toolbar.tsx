"use client";

import { AlertTriangle, Download, Plus, Search } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface InventoryToolbarProps {
  search: string;
  onSearchChangeAction: (value: string) => void;
  lowStockOnly: boolean;
  onLowStockToggleAction: () => void;
  onExportAction: () => void;
  exportDisabled: boolean;
  onAddProductAction: () => void;
}

export function InventoryToolbar({
  search,
  onSearchChangeAction,
  lowStockOnly,
  onLowStockToggleAction,
  onExportAction,
  exportDisabled,
  onAddProductAction,
}: InventoryToolbarProps) {
  const { t } = usePreferences();
  return (
    <div className="mb-5 mt-4 flex flex-row items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none z-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder={t("inventory.searchPlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            value={search}
            onChange={(e) => onSearchChangeAction(e.target.value)}
            data-testid="input-search-products"
          />
        </div>

        {/* Low Stock toggle */}
        <button
          onClick={onLowStockToggleAction}
          data-testid="button-filter-low-stock"
          className={`flex cursor-pointer items-center rounded-xl px-3 py-2 text-sm font-medium shadow-xs transition-all ${
            lowStockOnly
              ? "bg-[#00a2be] text-white hover:bg-[#008ea6]"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <AlertTriangle className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{t("inventory.lowStock")}</span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Export */}
        <button
          onClick={onExportAction}
          disabled={exportDisabled}
          data-testid="button-export-inventory"
          className="flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("inventory.export")}</span>
        </button>

        {/* Add Product */}
        <button
          onClick={onAddProductAction}
          data-testid="button-add-product"
          className="flex cursor-pointer items-center rounded-xl bg-[#00a2be] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#008ea6]"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("inventory.addProduct")}</span>
        </button>
      </div>
    </div>
  );
}
