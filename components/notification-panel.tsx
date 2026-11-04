"use client";

import { Bell, Check, X, AlertTriangle, Lightbulb } from "lucide-react";

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stockLevel: number;
  reorderPoint: number;
}

export interface PendingSuggestion {
  id: number;
  productId: number;
  suggestedQuantity: number;
  reason?: string | null;
  product?: { id: number; name: string; sku: string } | null;
}

export interface NotificationData {
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

export function NotificationPanel({
  notifications,
  alertCount,
  pushActive,
  onCloseAction,
}: {
  notifications: NotificationData | null;
  alertCount: number;
  pushActive: boolean;
  onCloseAction: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 rounded-2xl border border-gray-100 bg-white p-3.5 text-xs shadow-xl duration-150">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <Bell className="h-4 w-4 text-gray-500" />
          <span>Notifications</span>
        </div>
        <button
          onClick={onCloseAction}
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
  );
}
