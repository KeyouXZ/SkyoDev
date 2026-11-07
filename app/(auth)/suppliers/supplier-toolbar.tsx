"use client";

import { Plus, Search } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface SupplierToolbarProps {
  search: string;
  onSearchChangeAction: (value: string) => void;
  onNewSupplierAction: () => void;
}

export function SupplierToolbar({
  search,
  onSearchChangeAction,
  onNewSupplierAction,
}: SupplierToolbarProps) {
  const { t } = usePreferences();
  return (
    <div className="mb-5 mt-4 flex flex-row items-center justify-between gap-2">
      <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder={t("suppliers.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChangeAction(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
        />
      </div>
      <button
        onClick={onNewSupplierAction}
        className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
      >
        <Plus className="h-4 w-4 sm:mr-0" />
        <span className="hidden sm:inline">{t("suppliers.newSupplier")}</span>
      </button>
    </div>
  );
}
