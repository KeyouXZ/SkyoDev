"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePreferences } from "@/context/PreferencesContext";
import { formatDollars } from "@/lib/format";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import type { ProductWithSupplier } from "@/types/inventory";
import type { Tab } from "./types";

export function useSell() {
  const { t, currency } = usePreferences();
  const [tab, setTab] = useState<Tab>("record");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: allSales = [], mutate: mutateSales } = useSales();
  const sales = useMemo(() => allSales.slice(0, 30), [allSales]);

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
      toast.error(t("sell.insufficientStock"), {
        description: t("sell.onlyAvailable", {
          count: selected.stockLevel,
          name: selected.name,
        }),
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
        throw new Error(data?.error ?? t("sell.failedToRecord"));
      }

      toast.success(t("sell.saleRecorded"), {
        description: `${quantity} × ${selected.name} — ${formatDollars(total, currency)}`,
      });
      setSelectedId(null);
      setQuantity(1);
      mutateSales();
      setTab("recent");
    } catch (err) {
      toast.error(t("sell.couldNotRecord"), {
        description:
          err instanceof Error ? err.message : t("sell.somethingWentWrong"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tab,
    setTab,
    query,
    setQuery,
    selected,
    setSelectedId,
    quantity,
    setQuantity,
    submitting,
    productsLoading,
    sales,
    results,
    total,
    insufficient,
    handleSelect,
    handleRecordSale,
  };
}
