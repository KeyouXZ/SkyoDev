"use client";

import { Package, Plus, ShoppingBag, AlertTriangle, Check } from "lucide-react";

export interface ScannedProduct {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  cost: number;
  stockLevel: number;
  reorderPoint: number;
  supplier?: { id: number; name: string; phone?: string | null } | null;
}

export interface ScanResult {
  product: ScannedProduct;
  isLowStock: boolean;
  hasPendingSuggestion: boolean;
}

export function ProductResult({
  result,
  receiveQty,
  onReceiveQtyChangeAction,
  busy,
  onReceiveAction,
  onSellAction,
}: {
  result: ScanResult;
  receiveQty: number;
  onReceiveQtyChangeAction: (qty: number) => void;
  busy: boolean;
  onReceiveAction: () => void;
  onSellAction: () => void;
}) {
  const p = result.product;

  return (
    <div className="mt-5 rounded-2xl border border-white/70 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">
              {p.name}
            </p>
            <p className="font-mono text-xs text-gray-500">
              {p.sku}
              {p.category ? ` · ${p.category}` : ""}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-base font-bold text-gray-900">
          ${(p.price / 100).toFixed(2)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 px-2 py-2.5">
          <p className="text-xs text-gray-500">In stock</p>
          <p
            className={`mt-0.5 text-sm font-bold ${
              result.isLowStock ? "text-red-600" : "text-gray-900"
            }`}
          >
            {p.stockLevel}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2.5">
          <p className="text-xs text-gray-500">Reorder point</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {p.reorderPoint}
          </p>
        </div>
      </div>

      {result.isLowStock && (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Low stock — at or below reorder point.
          {result.hasPendingSuggestion
            ? " A reorder suggestion is pending."
            : ""}
        </p>
      )}

      {p.supplier && (
        <p className="mt-3 text-xs text-gray-500">
          Supplier:{" "}
          <span className="font-medium text-gray-700">{p.supplier.name}</span>
          {p.supplier.phone ? ` · ${p.supplier.phone}` : ""}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Receive</span>
            <input
              type="number"
              min={1}
              value={receiveQty}
              onChange={(e) =>
                onReceiveQtyChangeAction(
                  Math.max(1, parseInt(e.target.value, 10) || 1),
                )
              }
              className="h-10 w-20 rounded-xl border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 shadow-xs outline-none focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            />
            <span className="text-xs text-gray-500">units</span>
          </div>
          <button
            onClick={onReceiveAction}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Receive
          </button>
        </div>
        <button
          onClick={onSellAction}
          disabled={busy || p.stockLevel < 1}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          Sell 1 — ${(p.price / 100).toFixed(2)}
        </button>
        <p className="flex items-center justify-center gap-1 text-center text-xs text-gray-400">
          <Check className="h-3 w-3" />
          Selling deducts stock automatically.
        </p>
      </div>
    </div>
  );
}
