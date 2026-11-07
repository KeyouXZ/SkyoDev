"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";
import type { DraftItem } from "./types";
import { OrderSupplierField } from "./order-supplier-field";
import { OrderItemsField } from "./order-items-field";
import { OrderNotesField } from "./order-notes-field";
import { OrderStatusField } from "./order-status-field";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";

export function OrderDialog({
  products,
  suppliers,
  onCloseAction,
  onCreatedAction,
}: {
  products: ProductWithSupplier[];
  suppliers: SupplierSummary[];
  onCloseAction: () => void;
  onCreatedAction: () => void;
}) {
  const { t, currency } = usePreferences();
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      )
      .filter((p) => !items.some((i) => i.productId === p.id))
      .slice(0, 6);
  }, [products, search, items]);

  const total = items.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.productId);
    return sum + i.quantity * (p?.cost ?? 0);
  }, 0);

  const addItem = (p: ProductWithSupplier) => {
    setItems((prev) => [...prev, { productId: p.id, quantity: 1 }]);
    setSearch("");
  };

  const setQty = (productId: number, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, qty || 1) }
          : i,
      ),
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error(t("purchaseOrders.addAtLeastOne"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: supplier.trim() || null,
          notes: notes.trim() || null,
          status,
          items,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error ?? t("purchaseOrders.failedToCreate"));

      toast.success(t("purchaseOrders.orderCreated"), {
        description: `PO #${data.id} with ${items.length} item(s).`,
      });
      onCreatedAction();
    } catch (err) {
      toast.error(t("purchaseOrders.couldNotCreate"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onCloseAction()}
      />
      <div className="relative m-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {t("purchaseOrders.newPurchaseOrder")}
          </h2>
          <button
            onClick={onCloseAction}
            disabled={submitting}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <OrderSupplierField
            supplier={supplier}
            suppliers={suppliers}
            onSupplierChangeAction={setSupplier}
          />
          <OrderItemsField
            search={search}
            results={results}
            items={items}
            products={products}
            onSearchChangeAction={setSearch}
            onAddItemAction={addItem}
            onQtyChangeAction={setQty}
            onRemoveAction={removeItem}
          />
          <OrderNotesField notes={notes} onNotesChangeAction={setNotes} />
          <OrderStatusField status={status} onStatusChangeAction={setStatus} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <span className="text-sm text-gray-500">
            {t("purchaseOrders.total")}:{" "}
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(total, currency)}
            </span>
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? t("purchaseOrders.creating")
              : t("purchaseOrders.createOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
