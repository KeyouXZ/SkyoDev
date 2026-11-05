"use client";

import { Send, PackageCheck, Trash2 } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_STYLES, type OrderStatus, type PurchaseOrder } from "./types";

interface OrderCardProps {
  order: PurchaseOrder;
  busy: boolean;
  onUpdateStatusAction: (order: PurchaseOrder, status: OrderStatus) => void;
  onDeleteAction: (order: PurchaseOrder) => void;
}

export function orderTotal(o: PurchaseOrder): number {
  return (
    o.items.reduce((sum, i) => sum + i.quantity * (i.product?.cost ?? 0), 0) /
    100
  );
}

export function OrderCard({
  order: o,
  busy,
  onUpdateStatusAction,
  onDeleteAction,
}: OrderCardProps) {
  const { t, currency, locale } = usePreferences();
  return (
    <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              PO #{o.id}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}
            >
              {t(`purchaseOrders.${o.status}`)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {o.supplier ? `${o.supplier} · ` : ""}
            {formatDate(o.createdAt, locale, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-gray-900">
            {formatCurrency(Math.round(orderTotal(o) * 100), currency)}
          </p>
          <p className="text-xs text-gray-500">
            {o.items.length}{" "}
            {o.items.length === 1 ? t("common.item") : t("common.items")}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
        {o.items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate text-gray-700">
              {i.product?.name ?? `Product #${i.productId}`}
              <span className="ml-2 font-mono text-xs text-gray-400">
                {i.product?.sku}
              </span>
            </span>
            <span className="shrink-0 text-gray-500">
              × {i.quantity}
              <span className="ml-2 font-medium text-gray-800">
                {formatCurrency(i.quantity * (i.product?.cost ?? 0), currency)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {o.notes && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-gray-500">
          {o.notes}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {o.status === "draft" && (
          <button
            onClick={() => onUpdateStatusAction(o, "sent")}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a2be] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {t("purchaseOrders.send")}
          </button>
        )}
        {o.status === "sent" && (
          <button
            onClick={() => onUpdateStatusAction(o, "received")}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            {t("purchaseOrders.markReceived")}
          </button>
        )}
        <button
          onClick={() => onDeleteAction(o)}
          disabled={busy}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("common.delete")}
        </button>
      </div>
    </div>
  );
}
