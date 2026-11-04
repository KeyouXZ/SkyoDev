"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Search,
  ShoppingBag,
  Package,
  Minus,
  Plus,
  Check,
  AlertTriangle,
  History,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { ProductWithSupplier } from "@/types/inventory";

interface SaleRecord {
  id: number;
  quantity: number;
  saleDate: string;
  product?: { id: number; name: string; sku: string; price: number } | null;
}

type Tab = "record" | "recent";

export default function SellPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("record");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useSWR<
    ProductWithSupplier[]
  >("/api/products", fetcher, swrOptions);
  const { data: sales = [], mutate: mutateSales } = useSWR<SaleRecord[]>(
    "/api/sales?limit=30",
    fetcher,
    swrOptions,
  );

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, query]);

  const total = selected ? (selected.price / 100) * quantity : 0;
  const insufficient = selected ? quantity > selected.stockLevel : false;

  const handleSelect = (p: ProductWithSupplier) => {
    setSelectedId(p.id);
    setQuantity(1);
    setQuery("");
  };

  const handleRecordSale = async () => {
    if (!selected || quantity < 1) return;
    if (quantity > selected.stockLevel) {
      toast.error("Insufficient stock", {
        description: `Only ${selected.stockLevel} units of ${selected.name} available.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selected.id, quantity }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to record sale");
      }

      toast.success("Sale recorded", {
        description: `${quantity} × ${selected.name} — $${total.toFixed(2)}`,
      });
      setSelectedId(null);
      setQuantity(1);
      mutateSales();
      setTab("recent");
    } catch (err) {
      toast.error("Could not record sale", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof ShoppingBag }[] = [
    { key: "record", label: "Record Sell", icon: ShoppingBag },
    { key: "recent", label: "Recent Sell", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header title="Sell Products" setSidebarOpen={setSidebarOpen} />

          {/* Tabs */}
          <div className="mt-5 flex gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#00a2be] text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {t.key === "recent" && sales.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-[#00a2be]/15 text-[#00a2be]"
                      }`}
                    >
                      {sales.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-5 w-full max-w-2xl flex-1">
            {tab === "record" ? (
              <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">
                      Record Sale
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Search by SKU or name, then record the sale
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Search by SKU or product name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
                  />
                  {query.trim() && (
                    <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                      {productsLoading ? (
                        <p className="px-4 py-3 text-sm text-gray-400">
                          Loading products…
                        </p>
                      ) : results.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">
                          No products match your search.
                        </p>
                      ) : (
                        results.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelect(p)}
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
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ${(p.price / 100).toFixed(2)}
                              </p>
                              <p
                                className={`text-xs ${
                                  p.stockLevel <= p.reorderPoint
                                    ? "font-semibold text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {p.stockLevel} in stock
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected product */}
                {selected ? (
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
                        onClick={() => setSelectedId(null)}
                        className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        Change
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-slate-50 px-2 py-2.5">
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900">
                          ${(selected.price / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-2.5">
                        <p className="text-xs text-gray-500">In stock</p>
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
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="mt-0.5 text-sm font-bold text-[#00a2be]">
                          ${total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
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
                            setQuantity(
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          className="h-9 w-16 rounded-xl border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 shadow-xs outline-none focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
                        />
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
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
                        Only {selected.stockLevel} units available.
                      </p>
                    )}

                    <button
                      onClick={handleRecordSale}
                      disabled={submitting || insufficient}
                      className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        "Recording…"
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Record Sale — ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/70 bg-white/50 px-4 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-800">
                      No product selected
                    </p>
                    <p className="mt-1 max-w-60 text-xs text-gray-500">
                      Search above to find a product by SKU or name, then record
                      the sale.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">
                      Recent Sales
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Latest recorded transactions
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {sales.length === 0 ? (
                    <div className="rounded-2xl border border-white/70 bg-white/50 p-8 text-center text-sm text-gray-400">
                      No sales recorded yet.
                    </div>
                  ) : (
                    sales.slice(0, 15).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-3.5 py-3 shadow-sm sm:px-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {s.product?.name ??
                              `Product #${s.product?.id ?? ""}`}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {s.quantity} × $
                            {((s.product?.price ?? 0) / 100).toFixed(2)}
                            <span className="mx-1 text-gray-300">·</span>
                            {new Date(s.saleDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-[#00a2be]">
                          $
                          {(
                            (s.quantity * (s.product?.price ?? 0)) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
