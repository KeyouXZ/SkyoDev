"use client";

import { Search } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface ManualSkuEntryProps {
  sku: string;
  looking: boolean;
  onSkuChangeAction: (value: string) => void;
  onLookupAction: (sku: string) => void;
}

export function ManualSkuEntry({
  sku,
  looking,
  onSkuChangeAction,
  onLookupAction,
}: ManualSkuEntryProps) {
  const { t } = usePreferences();
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onLookupAction(sku);
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder={t("scanner.enterSku")}
          value={sku}
          onChange={(e) => onSkuChangeAction(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 font-mono text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:font-sans placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
        />
      </div>
      <button
        type="submit"
        disabled={looking || !sku.trim()}
        className="cursor-pointer rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {looking ? t("scanner.looking") : t("scanner.lookup")}
      </button>
    </form>
  );
}
