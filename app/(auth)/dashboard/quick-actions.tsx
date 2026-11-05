"use client";

import {
  ShoppingBag,
  ScanLine,
  TrendingUp,
  LineChart as LineChartIcon,
  type LucideIcon,
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface QuickAction {
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  iconBg: string;
  href: string;
}

const ACTIONS: QuickAction[] = [
  {
    titleKey: "dashboard.viewAiForecast",
    subtitleKey: "dashboard.seeReorderSuggestions",
    icon: TrendingUp,
    iconBg: "bg-[#cfe9f8] text-[#0284c7]",
    href: "/forecast",
  },
  {
    titleKey: "dashboard.viewSalesForecast",
    subtitleKey: "dashboard.projectNext30Days",
    icon: LineChartIcon,
    iconBg: "bg-[#c7f0f6] text-[#0891b2]",
    href: "/forecast",
  },
  {
    titleKey: "dashboard.sellProducts",
    subtitleKey: "dashboard.recordASell",
    icon: ShoppingBag,
    iconBg: "bg-[#d1fae5] text-[#10b981]",
    href: "/sell",
  },
  {
    titleKey: "dashboard.barcodeScanner",
    subtitleKey: "dashboard.scanToReceiveOrSell",
    icon: ScanLine,
    iconBg: "bg-[#ffedd5] text-[#f97316]",
    href: "/scanner",
  },
];

export function QuickActions({
  onNavigateAction,
}: {
  onNavigateAction: (href: string) => void;
}) {
  const { t } = usePreferences();
  return (
    <div className="flex flex-col justify-between lg:col-span-4">
      <div className="mb-3 px-1">
        <h3 className="text-xl font-bold tracking-tight text-gray-900">
          {t("dashboard.quickActions")}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          {t("dashboard.commonTasks")}
        </p>
      </div>
      <div className="space-y-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.titleKey}
              onClick={() => onNavigateAction(action.href)}
              className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-white/70 bg-linear-to-r from-[#d8eef9] to-[#cae7f7] p-3 px-4 text-left shadow-xs transition-all duration-150 hover:translate-x-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105 ${action.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-gray-900">
                  {t(action.titleKey)}
                </h4>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {t(action.subtitleKey)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
