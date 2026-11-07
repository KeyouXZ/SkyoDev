"use client";

import { User as UserIcon, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "@/auth/action";
import { usePreferences } from "@/context/PreferencesContext";

export function UserDropdown({
  displayName,
  email,
  open,
  onToggleAction,
  onCloseAction,
  onAccountSettingsAction,
}: {
  displayName: string;
  email?: string;
  open: boolean;
  onToggleAction: () => void;
  onCloseAction: () => void;
  onAccountSettingsAction: () => void;
}) {
  const { t } = usePreferences();
  return (
    <div className="relative">
      <button
        onClick={onToggleAction}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-xs transition-all hover:shadow-sm sm:px-3.5 sm:text-sm"
        aria-expanded={open}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00a2be]/15 text-[#00a2be]">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
        <span className="hidden max-w-25 truncate font-semibold text-gray-700 sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onCloseAction} />
          <div className="absolute right-0 z-50 mt-2 w-52 animate-in fade-in zoom-in-95 rounded-2xl border border-gray-100 bg-white py-1.5 text-sm shadow-lg duration-100">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="truncate text-xs font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-500">{email}</p>
            </div>
            <button
              onClick={onAccountSettingsAction}
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
  );
}
