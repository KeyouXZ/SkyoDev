"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ScanResult } from "./types";

export function useScanner() {
  const { t, currency } = usePreferences();
  const [sku, setSku] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiveQty, setReceiveQty] = useState(1);
  const [busyAction, setBusyAction] = useState<"receive" | "sell" | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(
    null,
  );

  const scannerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({
    value: "",
    at: 0,
  });

  const stopCamera = useCallback(async () => {
    const scanner = qrCodeRef.current;
    qrCodeRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // Already stopped.
      }
      scanner.clear();
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  const lookup = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      setLooking(true);
      setResult(null);
      try {
        const res = await fetch(
          `/api/scanner?sku=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error ?? t("scanner.productNotFound"));
        }
        setResult(data as ScanResult);
        setReceiveQty(1);
      } catch (err) {
        setAlert({
          title: t("scanner.productNotFound"),
          message:
            err instanceof Error
              ? err.message
              : t("scanner.somethingWentWrong"),
        });
      } finally {
        setLooking(false);
      }
    },
    [t],
  );

  const startCamera = useCallback(async () => {
    const el = scannerRef.current;
    if (!el) return;
    try {
      const scanner = new Html5Qrcode("niraga-scanner");
      qrCodeRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 160 } },
        (decodedText) => {
          const value = decodedText.trim();
          if (!value) return;
          const now = Date.now();
          // Debounce repeat scans of the same code.
          if (
            value !== lastScanRef.current.value ||
            now - lastScanRef.current.at > 2500
          ) {
            lastScanRef.current = { value, at: now };
            setSku(value);
            lookup(value);
          }
        },
        () => {
          // Per-frame decode errors are expected; ignore.
        },
      );
      setScanning(true);
    } catch (err) {
      setAlert({
        title: t("scanner.cameraUnavailable"),
        message: err instanceof Error ? err.message : t("scanner.cameraHint"),
      });
      stopCamera();
    }
  }, [lookup, stopCamera, t]);

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
      setAlert({
        title: t("scanner.outOfStock"),
        message: t("scanner.noStockToSell", { name: result.product.name }),
      });
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

  return {
    sku,
    setSku,
    result,
    looking,
    scanning,
    receiveQty,
    setReceiveQty,
    busyAction,
    alert,
    setAlert,
    scannerRef,
    stopCamera,
    startCamera,
    lookup,
    handleReceive,
    handleSell,
  };
}
