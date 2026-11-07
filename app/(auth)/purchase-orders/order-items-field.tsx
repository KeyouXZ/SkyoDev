"use client";

import { usePreferences } from "@/context/PreferencesContext";
import type { ProductWithSupplier } from "@/types/inventory";
import type { DraftItem } from "./types";
import { OrderItemRow } from "./order-item-row";
import { ProductSearch } from "./product-search";

export function OrderItemsField({
  search,
  results,
  items,
  products,
  onSearchChangeAction,
  onAddItemAction,
  onQtyChangeAction,
  onRemoveAction,
}: {
  search: string;
  results: ProductWithSupplier[];
  items: DraftItem[];
  products: ProductWithSupplier[];
  onSearchChangeAction: (value: string) => void;
  onAddItemAction: (product: ProductWithSupplier) => void;
  onQtyChangeAction: (productId: number, qty: number) => void;
  onRemoveAction: (productId: number) => void;
}) {
  const { t } = usePreferences();
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {t("purchaseOrders.items")}
      </label>
      <ProductSearch
        search={search}
        onSearchChangeAction={onSearchChangeAction}
        results={results}
        onAddItemAction={onAddItemAction}
      />

      {items.length > 0 && (
        <div className="mt-2 space-y-2">
          {items.map((i) => (
            <OrderItemRow
              key={i.productId}
              item={i}
              product={products.find((x) => x.id === i.productId)}
              onQtyChangeAction={onQtyChangeAction}
              onRemoveAction={onRemoveAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
