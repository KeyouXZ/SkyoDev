"use client";

import {
  Loader2,
  Pencil,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Package,
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import type { Supplier } from "./types";

interface SupplierCardProps {
  supplier: Supplier;
  busy: boolean;
  onEditAction: (supplier: Supplier) => void;
  onDeleteAction: (supplier: Supplier) => void;
}

export function SupplierCard({
  supplier: s,
  busy,
  onEditAction,
  onDeleteAction,
}: SupplierCardProps) {
  const { t } = usePreferences();
  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/60 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">
              {s.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Package className="h-3 w-3" />
              {s._count?.products ?? 0}{" "}
              {(s._count?.products ?? 0) === 1
                ? t("suppliers.product")
                : t("suppliers.products")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEditAction(s)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label={`Edit ${s.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteAction(s)}
            disabled={busy}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Delete ${s.name}`}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
        {s.email && (
          <p className="flex items-center gap-2 truncate text-gray-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{s.email}</span>
          </p>
        )}
        {s.phone && (
          <p className="flex items-center gap-2 truncate text-gray-600">
            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{s.phone}</span>
          </p>
        )}
        {s.address && (
          <p className="flex items-start gap-2 text-gray-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>{s.address}</span>
          </p>
        )}
        {!s.email && !s.phone && !s.address && (
          <p className="text-xs text-gray-400">{t("suppliers.noContact")}</p>
        )}
      </div>
    </div>
  );
}
