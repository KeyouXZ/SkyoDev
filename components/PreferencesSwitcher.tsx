"use client";

import { useState } from "react";
import { Globe, ChevronDown, DollarSign } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import type { Currency, Locale } from "@/lib/format";

export function PreferencesSwitcher() {
  const { locale, currency, setLocale, setCurrency } = usePreferences();
  const [open, setOpen] = useState(false);

  const localeLabel = locale === "en" ? "EN" : "ID";
  const currencyLabel = currency === "USD" ? "$" : "Rp";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:shadow-sm"
        aria-label="Language and currency"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 text-[#00a2be]" />
        <span>{localeLabel}</span>
        <span className="text-gray-300">·</span>
        <DollarSign className="h-3 w-3 text-gray-400" />
        <span>{currencyLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 animate-in fade-in zoom-in-95 rounded-2xl border border-gray-100 bg-white py-2 text-sm shadow-lg duration-100">
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Language
            </p>
            {(["en", "id"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                  locale === l ? "font-bold text-[#00a2be]" : "text-gray-700"
                }`}
              >
                <span>{l === "en" ? "English" : "Bahasa Indonesia"}</span>
                {locale === l && <span className="text-[#00a2be]">✓</span>}
              </button>
            ))}
            <div className="my-1.5 border-t border-gray-100" />
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Currency
            </p>
            {(["USD", "IDR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                  currency === c ? "font-bold text-[#00a2be]" : "text-gray-700"
                }`}
              >
                <span>{c === "USD" ? "US Dollar ($)" : "Rupiah (Rp)"}</span>
                {currency === c && <span className="text-[#00a2be]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
