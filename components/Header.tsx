"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Bell,
  User as UserIcon,
  ChevronDown,
  Check,
  X,
  Menu,
  LogOut,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { signOut } from "@/auth/action";
import type { CurrentUser } from "@/auth/currentUser";
import { useUser } from "@/context/UserContext";
import { fetcher, swrOptions } from "@/lib/fetcher";

export interface HeaderProps {
  title?: string;
  setSidebarOpen?: (open: boolean) => void;
  onMenuClick?: () => void;
  user?: CurrentUser;
  className?: string;
  children?: React.ReactNode;
}

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stockLevel: number;
  reorderPoint: number;
}

interface PendingSuggestion {
  id: number;
  productId: number;
  suggestedQuantity: number;
  reason?: string | null;
  product?: { id: number; name: string; sku: string } | null;
}

interface NotificationData {
  alerts: {
    lowStockCount: number;
    lowStockProducts: LowStockProduct[];
    pendingSuggestionsCount: number;
    pendingSuggestions: PendingSuggestion[];
  };
  subscribers: {
    userSubscribers: number;
    totalSubscribers: number;
  };
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
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotificationToast(!showNotificationToast)}
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
          aria-label="Notifications"
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
            <span className="max-w-25 truncate font-semibold text-gray-700">
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
                  Account Settings
                </button>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Notification Toast */}
        {showNotificationToast && (
          <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 rounded-2xl border border-gray-100 bg-white p-3.5 text-xs shadow-xl duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Bell className="h-4 w-4 text-gray-500" />
                <span>Notifications</span>
              </div>
              <button
                onClick={() => setShowNotificationToast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {pushActive && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                <span>Web Push Active</span>
              </div>
            )}

            {!notifications ? (
              <p className="mt-2 text-gray-500">Loading notifications…</p>
            ) : alertCount === 0 ? (
              <p className="mt-2 text-gray-500">
                No alerts. Stock levels and reorder suggestions look healthy.
              </p>
            ) : (
              <div className="mt-2 max-h-64 space-y-3 overflow-y-auto pr-1">
                {notifications.alerts.lowStockCount > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Low stock ({notifications.alerts.lowStockCount})
                    </p>
                    <ul className="mt-1 space-y-1">
                      {notifications.alerts.lowStockProducts.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-red-50 px-2 py-1.5"
                        >
                          <span className="min-w-0 truncate font-medium text-gray-800">
                            {p.name}
                          </span>
                          <span className="shrink-0 font-semibold text-red-600">
                            {p.stockLevel} left
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {notifications.alerts.pendingSuggestionsCount > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold text-amber-600">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Reorder suggestions (
                      {notifications.alerts.pendingSuggestionsCount})
                    </p>
                    <ul className="mt-1 space-y-1">
                      {notifications.alerts.pendingSuggestions.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-2 py-1.5"
                        >
                          <span className="min-w-0 truncate font-medium text-gray-800">
                            {s.product?.name ?? `Product #${s.productId}`}
                          </span>
                          <span className="shrink-0 font-semibold text-amber-700">
                            +{s.suggestedQuantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
