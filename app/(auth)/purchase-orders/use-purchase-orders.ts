"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePreferences } from "@/context/PreferencesContext";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useOrders } from "@/hooks/useOrders";
import type { OrderStatus, PurchaseOrder, StatusFilter } from "./types";

export type BusyAction = { id: number; action: "send" | "received" | "delete" };

export function usePurchaseOrders() {
  const { t } = usePreferences();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PurchaseOrder | null>(
    null,
  );
  const [pendingStatus, setPendingStatus] = useState<{
    order: PurchaseOrder;
    status: OrderStatus;
  } | null>(null);

  const { data: orders = [], mutate: mutateOrders } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();

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
    setBusyAction({
      id: order.id,
      action: status === "sent" ? "send" : "received",
    });
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
      setBusyAction(null);
      setPendingStatus(null);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    setBusyAction({ id: order.id, action: "delete" });
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
      setBusyAction(null);
      setPendingDelete(null);
    }
  };

  return {
    filter,
    setFilter,
    dialogOpen,
    setDialogOpen,
    busyAction,
    pendingDelete,
    setPendingDelete,
    pendingStatus,
    setPendingStatus,
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
