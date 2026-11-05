"use client";

import { Plus } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import type { StatusFilter } from "./types";

interface OrderToolbarProps {
  filter: StatusFilter;
  counts: Record<StatusFilter, number>;
  onFilterChangeAction: (filter: StatusFilter) => void;
  onNewOrderAction: () => void;
}

const FILTERS: { key: StatusFilter; labelKey: string }[] = [
  { key: "all", labelKey: "common.all" },
  { key: "draft", labelKey: "purchaseOrders.draft" },
  { key: "sent", labelKey: "purchaseOrders.sent" },
  { key: "received", labelKey: "purchaseOrders.received" },
];

export function OrderToolbar({
  filter,
  counts,
  onFilterChangeAction,
  onNewOrderAction,
}: OrderToolbarProps) {
  const { t } = usePreferences();
  return (
    <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChangeAction(f.key)}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-[#00a2be] text-white shadow-sm"
                : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
            }`}
          >
            {t(f.labelKey)}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                filter === f.key
                  ? "bg-white/25 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onNewOrderAction}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
      >
        <Plus className="h-4 w-4" />
        {t("purchaseOrders.newPurchaseOrder")}
      </button>
    </div>
  );
}
