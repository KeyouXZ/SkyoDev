"use client";

import { Package, Minus, Plus, Check, AlertTriangle } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency, formatDollars } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";

interface SelectedProductProps {
  selected: ProductWithSupplier;
  quantity: number;
  total: number;
  insufficient: boolean;
  submitting: boolean;
  onClearSelectionAction: () => void;
  onQuantityChangeAction: (qty: number) => void;
  onRecordAction: () => void;
}

export function SelectedProduct({
  selected,
  quantity,
  total,
  insufficient,
  submitting,
  onClearSelectionAction,
  onQuantityChangeAction,
  onRecordAction,
}: SelectedProductProps) {
  const { t, currency } = usePreferences();
  return (
    <div className="mt-5 rounded-2xl border border-white/70 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">
              {selected.name}
            </p>
            <p className="font-mono text-xs text-gray-500">
              {selected.sku}
              {selected.category ? ` · ${selected.category}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClearSelectionAction}
          className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          {t("sell.change")}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 px-2 py-2.5">
          <p className="text-xs text-gray-500">{t("sell.price")}</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {formatCurrency(selected.price, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2.5">
          <p className="text-xs text-gray-500">{t("sell.inStock")}</p>
          <p
            className={`mt-0.5 text-sm font-bold ${
              selected.stockLevel <= selected.reorderPoint
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {selected.stockLevel}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2.5">
          <p className="text-xs text-gray-500">{t("sell.total")}</p>
          <p className="mt-0.5 text-sm font-bold text-[#00a2be]">
            {formatDollars(total, currency)}
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">
          {t("sell.quantity")}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChangeAction(Math.max(1, quantity - 1))}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition-colors hover:bg-gray-50 disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              onQuantityChangeAction(
                Math.max(1, parseInt(e.target.value, 10) || 1),
              )
            }
            className="h-9 w-16 rounded-xl border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 shadow-xs outline-none focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
          />
          <button
            onClick={() => onQuantityChangeAction(quantity + 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition-colors hover:bg-gray-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {insufficient && (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {t("sell.onlyUnitsAvailable", { count: selected.stockLevel })}
        </p>
      )}

      <button
        onClick={onRecordAction}
        disabled={submitting || insufficient}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          t("sell.recording")
        ) : (
          <>
            <Check className="h-4 w-4" />
            {t("sell.recordSaleBtn")} — {formatDollars(total, currency)}
          </>
        )}
      </button>
    </div>
  );
}
