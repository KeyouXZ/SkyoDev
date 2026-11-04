"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ShoppingBag, History } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { ProductWithSupplier } from "@/types/inventory";
import { RecordSale } from "./record-sale";
import { RecentSales, type SaleRecord } from "./recent-sales";

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
              <RecordSale
                productsLoading={productsLoading}
                query={query}
                onQueryChangeAction={setQuery}
                results={results}
                selected={selected}
                onSelectAction={handleSelect}
                onClearSelectionAction={() => setSelectedId(null)}
                quantity={quantity}
                onQuantityChangeAction={setQuantity}
                total={total}
                insufficient={insufficient}
                submitting={submitting}
                onRecordAction={handleRecordSale}
              />
            ) : (
              <RecentSales sales={sales} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
