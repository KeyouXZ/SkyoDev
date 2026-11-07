"use client";

import { useState } from "react";
import useSWR from "swr";
import { Menu } from "lucide-react";
import type { CurrentUser } from "@/auth/currentUser";
import { useUser } from "@/context/UserContext";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { NotificationPanel, type NotificationData } from "./notification-panel";
import { PreferencesSwitcher } from "./PreferencesSwitcher";
import { AccountDialog } from "./AccountDialog";
import { NotificationBell } from "./NotificationBell";
import { UserDropdown } from "./UserDropdown";

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
  const user = propUser ?? contextUser;
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
    <>
      <header
        className={`sticky top-3 z-30 flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md ${className}`}
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
          <NotificationBell
            alertCount={alertCount}
            open={showNotificationToast}
            onToggleAction={() =>
              setShowNotificationToast(!showNotificationToast)
            }
          />
          <UserDropdown
            displayName={displayName}
            email={user?.email}
            open={userDropdownOpen}
            onToggleAction={() => setUserDropdownOpen(!userDropdownOpen)}
            onCloseAction={() => setUserDropdownOpen(false)}
            onAccountSettingsAction={() => {
              setUserDropdownOpen(false);
              setAccountOpen(true);
            }}
          />

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
      <AccountDialog
        open={accountOpen}
        onCloseAction={() => setAccountOpen(false)}
      />
    </>
  );
}

export default Header;
