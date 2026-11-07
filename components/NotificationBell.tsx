"use client";

import { Bell } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

export function NotificationBell({
  alertCount,
  open,
  onToggleAction,
}: {
  alertCount: number;
  open: boolean;
  onToggleAction: () => void;
}) {
  const { t } = usePreferences();
  return (
    <button
      onClick={onToggleAction}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
      aria-label={t("header.notifications")}
      aria-expanded={open}
    >
      <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      {alertCount > 0 && (
        <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {alertCount > 99 ? "99+" : alertCount}
        </span>
      )}
    </button>
  );
}
