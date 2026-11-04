"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X, Minus, Plus } from "lucide-react";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";
import type { DraftItem } from "./types";

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
      toast.error("Add at least one item");
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
      if (!res.ok) throw new Error(data?.error ?? "Failed to create order");

      toast.success("Purchase order created", {
        description: `PO #${data.id} with ${items.length} item(s).`,
      });
      onCreatedAction();
    } catch (err) {
      toast.error("Could not create order", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCloseAction}
      />
      <div className="relative m-0 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:m-4 sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            New Purchase Order
          </h2>
          <button
            onClick={onCloseAction}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Supplier */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            >
              <option value="">Select a supplier (optional)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="mt-1.5 text-xs text-gray-400">
                No suppliers yet. Add one from the Suppliers page first.
              </p>
            )}
          </div>

          {/* Items */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Items
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search products to add…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-xs outline-none placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
              />
              {search.trim() && results.length > 0 && (
                <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {p.name}
                        </p>
                        <p className="font-mono text-xs text-gray-500">
                          {p.sku}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        ${(p.cost / 100).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-2 space-y-2">
                {items.map((i) => {
                  const p = products.find((x) => x.id === i.productId);
                  return (
                    <div
                      key={i.productId}
                      className="flex items-center gap-2 rounded-xl border border-gray-100 bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {p?.name ?? `Product #${i.productId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(p ? p.cost / 100 : 0).toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQty(i.productId, i.quantity - 1)}
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
                            setQty(
                              i.productId,
                              parseInt(e.target.value, 10) || 1,
                            )
                          }
                          className="h-7 w-14 rounded-lg border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 outline-none focus:border-[#00a2be]"
                        />
                        <button
                          onClick={() => setQty(i.productId, i.quantity + 1)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(i.productId)}
                        className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Delivery instructions, references…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
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
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <span className="text-sm text-gray-500">
            Total:{" "}
            <span className="text-base font-bold text-gray-900">
              ${(total / 100).toFixed(2)}
            </span>
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="cursor-pointer rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
