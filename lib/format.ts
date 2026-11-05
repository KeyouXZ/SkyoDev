/**
 * Currency and number formatting.
 * DB stores prices in USD cents (e.g. 1299 = $12.99).
 * Display converts to the selected currency via the live USD→IDR rate
 * (see lib/exchange-rate.ts, falls back to 16,000).
 */
import { getExchangeRate } from "./exchange-rate";

export type Currency = "USD" | "IDR";
export type Locale = "en" | "id";

export const USD_TO_IDR_RATE = 16000;

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function convertCurrency(dollars: number, currency: Currency): number {
  return currency === "IDR" ? dollars * getExchangeRate() : dollars;
}

/**
 * Format a USD-cent value in the selected currency.
 * @example formatCurrency(1299, "USD") -> "$12.99"
 * @example formatCurrency(1299, "IDR") -> "Rp207.840"
 */
function resolveFractions(
  currency: Currency,
  opts?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
): { minimumFractionDigits: number; maximumFractionDigits: number } {
  // IDR has no minor units — Intl requires max 0 for it.
  const currencyMax = currency === "IDR" ? 0 : 20;
  const defaultFraction = currency === "IDR" ? 0 : 2;
  const maximumFractionDigits = Math.min(
    opts?.maximumFractionDigits ?? defaultFraction,
    currencyMax,
  );
  const minimumFractionDigits = Math.min(
    opts?.minimumFractionDigits ?? defaultFraction,
    maximumFractionDigits,
  );
  return { minimumFractionDigits, maximumFractionDigits };
}

export function formatCurrency(
  cents: number,
  currency: Currency,
  opts?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
): string {
  const dollars = centsToDollars(cents);
  const converted = convertCurrency(dollars, currency);
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...resolveFractions(currency, opts),
  }).format(converted);
}

/**
 * Format a dollar value (already in dollars, not cents) in the selected currency.
 * Useful for computed totals that are already in dollars.
 */
export function formatDollars(
  dollars: number,
  currency: Currency,
  opts?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
): string {
  const converted = convertCurrency(dollars, currency);
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...resolveFractions(currency, opts),
  }).format(converted);
}

export function formatNumber(
  value: number,
  locale: Locale,
  opts?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(
    locale === "id" ? "id-ID" : "en-US",
    opts,
  ).format(value);
}

export function formatDate(
  date: Date | string,
  locale: Locale,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    opts,
  ).format(d);
}
