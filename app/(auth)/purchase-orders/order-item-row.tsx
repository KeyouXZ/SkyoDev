"use client";

import { X, Minus, Plus } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";
import type { DraftItem } from "./types";

interface OrderItemRowProps {
  item: DraftItem;
  product: ProductWithSupplier | undefined;
  onQtyChangeAction: (productId: number, qty: number) => void;
  onRemoveAction: (productId: number) => void;
}

export function OrderItemRow({
  item: i,
  product: p,
  onQtyChangeAction,
  onRemoveAction,
}: OrderItemRowProps) {
  const { currency } = usePreferences();
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-slate-50 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {p?.name ?? `Product #${i.productId}`}
        </p>
        <p className="text-xs text-gray-500">
          {formatCurrency(p?.cost ?? 0, currency)} each
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onQtyChangeAction(i.productId, i.quantity - 1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Decrease"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={1}
          value={i.quantity}
          onChange={(e) =>
            onQtyChangeAction(i.productId, parseInt(e.target.value, 10) || 1)
          }
          className="h-7 w-14 rounded-lg border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 outline-none focus:border-[#00a2be]"
        />
        <button
          onClick={() => onQtyChangeAction(i.productId, i.quantity + 1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Increase"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        onClick={() => onRemoveAction(i.productId)}
        className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
