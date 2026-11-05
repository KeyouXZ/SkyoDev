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
    <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-72">
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
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
      >
        <Plus className="h-4 w-4" />
        {t("suppliers.newSupplier")}
      </button>
    </div>
  );
}
