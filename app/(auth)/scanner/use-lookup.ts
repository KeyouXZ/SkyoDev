"use client";

import { useCallback, useState } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { ScanResult } from "./types";

export function useLookup(onError: (title: string, message: string) => void) {
  const { t } = usePreferences();
  const [sku, setSku] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [receiveQty, setReceiveQty] = useState(1);

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
        onError(
          t("scanner.productNotFound"),
          err instanceof Error ? err.message : t("scanner.somethingWentWrong"),
        );
      } finally {
        setLooking(false);
      }
    },
    [t, onError],
  );

  return {
    sku,
    setSku,
    result,
    setResult,
    looking,
    receiveQty,
    setReceiveQty,
    lookup,
  };
}
