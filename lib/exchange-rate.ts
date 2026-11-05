/**
 * Realtime USD→IDR exchange rate with localStorage cache + fallback.
 * Fetches from open.er-api.com (free, no key). Falls back to cached
 * rate, then to FALLBACK_RATE when offline.
 */

export const FALLBACK_RATE = 16000;

const CACHE_KEY = "niraga-usd-idr-rate";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedRate: number = FALLBACK_RATE;

interface CachedRate {
  rate: number;
  at: number;
}

function readCache(): CachedRate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRate;
    if (typeof parsed.rate !== "number" || typeof parsed.at !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rate: number) {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rate, at: Date.now() } satisfies CachedRate),
    );
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function getExchangeRate(): number {
  return cachedRate;
}

export function setExchangeRate(rate: number) {
  if (Number.isFinite(rate) && rate > 0) {
    cachedRate = rate;
  }
}

/**
 * Fetch the live USD→IDR rate. Returns the rate (live, cached, or fallback).
 * Never throws — always resolves to a usable number.
 */
export async function fetchExchangeRate(): Promise<number> {
  const cached = readCache();
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    cachedRate = cached.rate;
    return cachedRate;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    const idr = data.rates?.IDR;
    if (data.result !== "success" || typeof idr !== "number" || idr <= 0) {
      throw new Error("Invalid rate payload");
    }
    cachedRate = idr;
    writeCache(idr);
    return cachedRate;
  } catch {
    // Offline / API down → use stale cache if available, else fallback.
    if (cached) {
      cachedRate = cached.rate;
      return cachedRate;
    }
    return cachedRate;
  }
}
