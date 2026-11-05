"use client";

import { ShoppingBag, History } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import type { Tab } from "./types";

interface SellTabsProps {
  tab: Tab;
  salesCount: number;
  onTabChangeAction: (tab: Tab) => void;
}

const TABS: { key: Tab; labelKey: string; icon: typeof ShoppingBag }[] = [
  { key: "record", labelKey: "sell.recordSell", icon: ShoppingBag },
  { key: "recent", labelKey: "sell.recentSell", icon: History },
];

export function SellTabs({
  tab,
  salesCount,
  onTabChangeAction,
}: SellTabsProps) {
  const { t } = usePreferences();
  return (
    <div className="mt-5 flex gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
      {TABS.map((tabItem) => {
        const Icon = tabItem.icon;
        const active = tab === tabItem.key;
        return (
          <button
            key={tabItem.key}
            onClick={() => onTabChangeAction(tabItem.key)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "bg-[#00a2be] text-white shadow-sm"
                : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(tabItem.labelKey)}
            {tabItem.key === "recent" && salesCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-[#00a2be]/15 text-[#00a2be]"
                }`}
              >
                {salesCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
