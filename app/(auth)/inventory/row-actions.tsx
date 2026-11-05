"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { ProductWithSupplier } from "@/types/inventory";

export function RowActions({
  product,
  testPrefix,
  busy = false,
  onEditAction,
  onDeleteAction,
}: {
  product: ProductWithSupplier;
  testPrefix: string;
  busy?: boolean;
  onEditAction: (product: ProductWithSupplier) => void;
  onDeleteAction: (product: ProductWithSupplier) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEditAction(product)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
        aria-label={`Edit ${product.name}`}
        data-testid={`${testPrefix}-edit-${product.id}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDeleteAction(product)}
        disabled={busy}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Delete ${product.name}`}
        data-testid={`${testPrefix}-delete-${product.id}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
