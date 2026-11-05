"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { usePreferences } from "@/context/PreferencesContext";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";
import type { OrderStatus, PurchaseOrder, StatusFilter } from "./types";

export function usePurchaseOrders() {
  const { t } = usePreferences();
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

  const updateStatus = async (order: PurchaseOrder, status: OrderStatus) => {
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error ?? t("purchaseOrders.failedToUpdate"));

      toast.success(
        status === "sent"
          ? t("purchaseOrders.poSent", { id: order.id })
          : t("purchaseOrders.poReceived", { id: order.id }),
        {
          description:
            status === "received"
              ? t("purchaseOrders.stockAdded")
              : t("purchaseOrders.supplierNotified"),
        },
      );
      mutateOrders();
    } catch (err) {
      toast.error(t("purchaseOrders.couldNotUpdate"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (!window.confirm(t("purchaseOrders.confirmDelete", { id: order.id })))
      return;
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error ?? t("purchaseOrders.failedToDelete"));
      toast.success(t("purchaseOrders.orderDeleted"));
      mutateOrders();
    } catch (err) {
      toast.error(t("purchaseOrders.couldNotDelete"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setBusyId(null);
    }
  };

  return {
    filter,
    setFilter,
    dialogOpen,
    setDialogOpen,
    busyId,
    orders,
    products,
    suppliers,
    filtered,
    counts,
    updateStatus,
    handleDelete,
    mutateOrders,
  };
}
