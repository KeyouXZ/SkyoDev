"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Plus, Send, PackageCheck, Trash2, ShoppingCart } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";
import { OrderDialog } from "./order-dialog";
import {
  STATUS_STYLES,
  type OrderStatus,
  type StatusFilter,
  type PurchaseOrder,
} from "./types";

export default function PurchaseOrdersPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data: orders = [], mutate: mutateOrders } = useSWR<PurchaseOrder[]>(
    "/api/purchase-orders",
    fetcher,
    swrOptions,
  );
  const { data: products = [] } = useSWR<ProductWithSupplier[]>(
    "/api/products",
    fetcher,
    swrOptions,
  );
  const { data: suppliers = [] } = useSWR<SupplierSummary[]>(
    "/api/suppliers",
    fetcher,
    swrOptions,
  );

  const filtered = useMemo(
    () =>
      filter === "all" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter],
  );

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: orders.length,
      draft: 0,
      sent: 0,
      received: 0,
    };
    for (const o of orders) c[o.status] += 1;
    return c;
  }, [orders]);

  const orderTotal = (o: PurchaseOrder) =>
    o.items.reduce((sum, i) => sum + i.quantity * (i.product?.cost ?? 0), 0) /
    100;

  const updateStatus = async (order: PurchaseOrder, status: OrderStatus) => {
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to update order");

      toast.success(
        status === "sent" ? `PO #${order.id} sent` : `PO #${order.id} received`,
        {
          description:
            status === "received"
              ? "Stock has been added to inventory."
              : "The supplier has been notified.",
        },
      );
      mutateOrders();
    } catch (err) {
      toast.error("Could not update order", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (!window.confirm(`Delete purchase order #${order.id}?`)) return;
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete order");
      toast.success("Purchase order deleted");
      mutateOrders();
    } catch (err) {
      toast.error("Could not delete order", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusyId(null);
    }
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "sent", label: "Sent" },
    { key: "received", label: "Received" },
  ];

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header title="Purchase Orders" setSidebarOpen={setSidebarOpen} />

          {/* Toolbar */}
          <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/60 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                    filter === f.key
                      ? "bg-[#00a2be] text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
                  }`}
                >
                  {f.label}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      filter === f.key
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setDialogOpen(true)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
            >
              <Plus className="h-4 w-4" />
              New Purchase Order
            </button>
          </div>

          {/* Orders list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/60 px-4 py-16 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-800">
                No purchase orders
              </p>
              <p className="mt-1 max-w-70 text-sm text-gray-500">
                {filter === "all"
                  ? "Create your first purchase order to start restocking."
                  : `No ${filter} orders right now.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          PO #{o.id}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {o.supplier ? `${o.supplier} · ` : ""}
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">
                        ${orderTotal(o).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {o.items.length}{" "}
                        {o.items.length === 1 ? "item" : "items"}
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
                            $
                            {(
                              (i.quantity * (i.product?.cost ?? 0)) /
                              100
                            ).toFixed(2)}
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
                        onClick={() => updateStatus(o, "sent")}
                        disabled={busyId === o.id}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a2be] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </button>
                    )}
                    {o.status === "sent" && (
                      <button
                        onClick={() => updateStatus(o, "received")}
                        disabled={busyId === o.id}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Mark Received
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(o)}
                      disabled={busyId === o.id}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {dialogOpen && (
        <OrderDialog
          products={products}
          suppliers={suppliers}
          onCloseAction={() => setDialogOpen(false)}
          onCreatedAction={() => {
            setDialogOpen(false);
            mutateOrders();
          }}
        />
      )}
    </div>
  );
}
