'use client';

import { useState } from 'react';
import {
  Bell,
  HelpCircle,
  User as UserIcon,
  ChevronDown,
  Check,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import { signOut } from '@/auth/action';
import type { CurrentUser } from '@/auth/currentUser';
import { useUser } from '@/context/UserContext';

export interface HeaderProps {
  title?: string;
  setSidebarOpen?: (open: boolean) => void;
  onMenuClick?: () => void;
  user?: CurrentUser;
  className?: string;
  children?: React.ReactNode;
}

export function Header({
  title = 'Dashboard',
  user: propUser,
  setSidebarOpen,
  onMenuClick,
  className = '',
  children,
}: HeaderProps) {
  const contextUser = useUser();
  const user = propUser ?? contextUser;
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const handleMenuClick = onMenuClick ?? (() => setSidebarOpen?.(true));

  return (
    <header className={`flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md ${className}`}>
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
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Help Button */}
        <button
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
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
            <span className="max-w-25 truncate font-semibold text-gray-700">{displayName}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-52 animate-in fade-in zoom-in-95 rounded-2xl border border-gray-100 bg-white py-1.5 text-sm shadow-lg duration-100">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="truncate text-xs font-semibold text-gray-900">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
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
          <div className="absolute right-0 top-12 z-50 w-72 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-gray-100 bg-white p-3.5 text-xs shadow-xl duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-semibold text-emerald-600">
                <Check className="h-4 w-4" />
                <span>Web Push Active</span>
              </div>
              <button onClick={() => setShowNotificationToast(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-gray-500">
              3 Low stock alerts recorded today. Restock suggestions are ready for review.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
