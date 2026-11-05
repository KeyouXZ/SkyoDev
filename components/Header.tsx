"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Bell,
  User as UserIcon,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";
import { signOut } from "@/auth/action";
import type { CurrentUser } from "@/auth/currentUser";
import { useUser } from "@/context/UserContext";
import { usePreferences } from "@/context/PreferencesContext";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { NotificationPanel, type NotificationData } from "./notification-panel";
import { PreferencesSwitcher } from "./PreferencesSwitcher";

export interface HeaderProps {
  title?: string;
  setSidebarOpen?: (open: boolean) => void;
  onMenuClick?: () => void;
  user?: CurrentUser;
  className?: string;
  children?: React.ReactNode;
}

export function Header({
  title = "Dashboard",
  user: propUser,
  setSidebarOpen,
  onMenuClick,
  className = "",
  children,
}: HeaderProps) {
  const contextUser = useUser();
  const { t } = usePreferences();
  const user = propUser ?? contextUser;
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { data: notifications } = useSWR<NotificationData>(
    "/api/notifications",
    fetcher,
    swrOptions,
  );

  const alertCount =
    (notifications?.alerts.lowStockCount ?? 0) +
    (notifications?.alerts.pendingSuggestionsCount ?? 0);
  const pushActive = (notifications?.subscribers.userSubscribers ?? 0) > 0;

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";
  const handleMenuClick = onMenuClick ?? (() => setSidebarOpen?.(true));

  return (
    <header
      className={`relative z-30 flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md ${className}`}
    >
      <div className="flex flex-1 items-center gap-3">
        {(onMenuClick || setSidebarOpen) && (
          <button
            onClick={handleMenuClick}
            className="rounded-full p-2 text-gray-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
        {children}
      </div>

      <div className="relative flex shrink-0 items-center gap-2.5">
        <PreferencesSwitcher />
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotificationToast(!showNotificationToast)}
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
          aria-label={t("header.notifications")}
        >
          <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          {alertCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-xs transition-all hover:shadow-sm sm:px-3.5 sm:text-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00a2be]/15 text-[#00a2be]">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <span className="hidden max-w-25 truncate font-semibold text-gray-700 sm:inline">
              {displayName}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-500 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-52 animate-in fade-in zoom-in-95 rounded-2xl border border-gray-100 bg-white py-1.5 text-sm shadow-lg duration-100">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="truncate text-xs font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-gray-700 hover:bg-slate-50"
                >
                  {t("header.accountSettings")}
                </button>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("header.signOut")}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Notification Panel */}
        {showNotificationToast && (
          <NotificationPanel
            notifications={notifications ?? null}
            alertCount={alertCount}
            pushActive={pushActive}
            onCloseAction={() => setShowNotificationToast(false)}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
