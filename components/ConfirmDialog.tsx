"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busyLabel,
  busy = false,
  onConfirmAction,
  onCancelAction,
  danger = true,
}: ConfirmDialogProps) {
  const { t } = usePreferences();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancelAction}
      />
      <div className="relative m-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <button
            onClick={onCancelAction}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                danger
                  ? "bg-red-50 text-red-600"
                  : "bg-[#00a2be]/10 text-[#00a2be]"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="pt-1.5 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onCancelAction}
            disabled={busy}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirmAction}
            disabled={busy}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#00a2be] hover:bg-[#008ea6]"
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy
              ? (busyLabel ?? t("common.deleting"))
              : (confirmLabel ?? t("common.delete"))}
          </button>
        </div>
      </div>
    </div>
  );
}
