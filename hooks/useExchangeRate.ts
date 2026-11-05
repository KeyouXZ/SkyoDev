"use client";

import { useEffect, useState } from "react";
import { fetchExchangeRate, getExchangeRate } from "@/lib/exchange-rate";

/**
 * Returns the live USD→IDR rate. Fetches on mount (cached 1h in
 * localStorage), falls back to the last known rate or 16,000.
 * Re-renders once the live rate arrives.
 */
export function useExchangeRate(): number {
  const [rate, setRate] = useState<number>(() => getExchangeRate());

  useEffect(() => {
    let cancelled = false;
    fetchExchangeRate().then((live) => {
      if (!cancelled) setRate(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return rate;
}
