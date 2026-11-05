"use client";

import { AlertCircle, X } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  onCloseAction: () => void;
}

export function AlertDialog({
  open,
  title,
  message,
  onCloseAction,
}: AlertDialogProps) {
  const { t } = usePreferences();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCloseAction}
      />
      <div className="relative m-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <button
            onClick={onCloseAction}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="pt-1.5 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-gray-100 px-5 py-4">
          <button
            onClick={onCloseAction}
            className="cursor-pointer rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
