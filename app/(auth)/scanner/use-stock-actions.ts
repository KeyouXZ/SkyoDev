"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ScanResult } from "./types";

export function useStockActions(
  result: ScanResult | null,
  setResult: React.Dispatch<React.SetStateAction<ScanResult | null>>,
  receiveQty: number,
  setReceiveQty: React.Dispatch<React.SetStateAction<number>>,
  onError: (title: string, message: string) => void,
) {
  const { t, currency } = usePreferences();
  const [busyAction, setBusyAction] = useState<"receive" | "sell" | null>(null);

  const handleReceive = async () => {
    if (!result || receiveQty < 1) return;
    setBusyAction("receive");
    try {
      const res = await fetch(`/api/products/${result.product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockLevel: result.product.stockLevel + receiveQty,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? t("scanner.failedToReceive"));
      }
      toast.success(t("scanner.stockReceived"), {
        description: `Added ${receiveQty} × ${result.product.name}. New stock: ${data.stockLevel}.`,
      });
      setResult((r) =>
        r
          ? { ...r, product: { ...r.product, stockLevel: data.stockLevel } }
          : r,
      );
      setReceiveQty(1);
    } catch (err) {
      toast.error(t("scanner.couldNotReceive"), {
        description:
          err instanceof Error ? err.message : t("scanner.somethingWentWrong"),
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSell = async () => {
    if (!result) return;
    if (result.product.stockLevel < 1) {
      onError(
        t("scanner.outOfStock"),
        t("scanner.noStockToSell", { name: result.product.name }),
      );
      return;
    }
    setBusyAction("sell");
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: result.product.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? t("scanner.failedToRecord"));
      }
      toast.success(t("scanner.saleRecorded"), {
        description: `1 × ${result.product.name} — ${formatCurrency(result.product.price, currency)}`,
      });
      setResult((r) =>
        r
          ? {
              ...r,
              product: {
                ...r.product,
                stockLevel: data.currentStock ?? r.product.stockLevel - 1,
              },
            }
          : r,
      );
    } catch (err) {
      toast.error(t("scanner.couldNotRecord"), {
        description:
          err instanceof Error ? err.message : t("scanner.somethingWentWrong"),
      });
    } finally {
      setBusyAction(null);
    }
  };

  return { busyAction, handleReceive, handleSell };
}
