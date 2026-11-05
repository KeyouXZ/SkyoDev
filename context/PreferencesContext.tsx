"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Currency, Locale } from "@/lib/format";
import { dictionaries, getNested, interpolate } from "@/lib/i18n";
import { fetchExchangeRate } from "@/lib/exchange-rate";

interface PreferencesValue {
  locale: Locale;
  currency: Currency;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const LOCALE_KEY = "niraga-locale";
const CURRENCY_KEY = "niraga-currency";

function readStored<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  return (v as T) ?? fallback;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Start with defaults so server and client first render match (no hydration
  // mismatch), then hydrate stored prefs after mount.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    // Hydrate from localStorage after mount to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(readStored<Locale>(LOCALE_KEY, "en"));
    setCurrencyState(readStored<Currency>(CURRENCY_KEY, "USD"));
    // Warm the realtime USD→IDR rate (cached 1h, falls back to 16,000).
    void fetchExchangeRate();
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(CURRENCY_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[locale];
      const raw =
        getNested(dict, path) ?? getNested(dictionaries.en, path) ?? path;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<PreferencesValue>(
    () => ({ locale, currency, setLocale, setCurrency, t }),
    [locale, currency, setLocale, setCurrency, t],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return ctx;
}
