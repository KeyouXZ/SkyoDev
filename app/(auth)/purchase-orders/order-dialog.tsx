"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";
import type { DraftItem } from "./types";
import { OrderItemRow } from "./order-item-row";
import { ProductSearch } from "./product-search";
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
          {/* Supplier */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("purchaseOrders.supplier")}
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            >
              <option value="">{t("purchaseOrders.selectSupplier")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="mt-1.5 text-xs text-gray-400">
                {t("purchaseOrders.noSuppliers")}
              </p>
            )}
          </div>

          {/* Items */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("purchaseOrders.items")}
            </label>
            <ProductSearch
              search={search}
              onSearchChangeAction={setSearch}
              results={results}
              onAddItemAction={addItem}
            />

            {items.length > 0 && (
              <div className="mt-2 space-y-2">
                {items.map((i) => (
                  <OrderItemRow
                    key={i.productId}
                    item={i}
                    product={products.find((x) => x.id === i.productId)}
                    onQtyChangeAction={setQty}
                    onRemoveAction={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("purchaseOrders.notes")}{" "}
              <span className="text-gray-400">
                {t("purchaseOrders.optional")}
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t("purchaseOrders.notesPlaceholder")}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("purchaseOrders.status")}
            </label>
            <div className="flex gap-2">
              {(["draft", "sent"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all ${
                    status === s
                      ? "bg-[#00a2be] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t(`purchaseOrders.${s}`)}
                </button>
              ))}
            </div>
          </div>
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
