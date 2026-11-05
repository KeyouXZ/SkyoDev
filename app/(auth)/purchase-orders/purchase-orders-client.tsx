"use client";

import { ShoppingCart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OrderDialog } from "./order-dialog";
import { OrderToolbar } from "./order-toolbar";
import { OrderCard } from "./order-card";
import { usePurchaseOrders } from "./use-purchase-orders";
import { usePreferences } from "@/context/PreferencesContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function PurchaseOrdersPageClient() {
  const { t } = usePreferences();
  const {
    filter,
    setFilter,
    dialogOpen,
    setDialogOpen,
    busyAction,
    pendingDelete,
    setPendingDelete,
    pendingStatus,
    setPendingStatus,
    products,
    suppliers,
    filtered,
    counts,
    updateStatus,
    handleDelete,
    mutateOrders,
  } = usePurchaseOrders();

  return (
    <PageShell title={t("purchaseOrders.title")}>
      <OrderToolbar
        filter={filter}
        counts={counts}
        onFilterChangeAction={setFilter}
        onNewOrderAction={() => setDialogOpen(true)}
      />

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/60 px-4 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-gray-800">
            {t("purchaseOrders.noOrders")}
          </p>
          <p className="mt-1 max-w-70 text-sm text-gray-500">
            {filter === "all"
              ? t("purchaseOrders.createFirst")
              : t("purchaseOrders.noStatusOrders", { status: filter })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              busyAction={busyAction?.id === o.id ? busyAction.action : null}
              onUpdateStatusAction={(order, status) =>
                setPendingStatus({ order, status })
              }
              onDeleteAction={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("common.delete")}
        message={t("purchaseOrders.confirmDelete", {
          id: pendingDelete?.id ?? "",
        })}
        busy={busyAction?.action === "delete"}
        onConfirmAction={() => pendingDelete && handleDelete(pendingDelete)}
        onCancelAction={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingStatus !== null}
        title={t("purchaseOrders.status")}
        message={
          pendingStatus?.status === "sent"
            ? t("purchaseOrders.poSent", { id: pendingStatus?.order.id ?? "" })
            : t("purchaseOrders.poReceived", {
                id: pendingStatus?.order.id ?? "",
              })
        }
        confirmLabel={
          pendingStatus?.status === "sent"
            ? t("purchaseOrders.send")
            : t("purchaseOrders.markReceived")
        }
        busyLabel={
          pendingStatus?.status === "sent"
            ? t("purchaseOrders.sending")
            : t("purchaseOrders.receiving")
        }
        danger={false}
        busy={busyAction !== null}
        onConfirmAction={() =>
          pendingStatus &&
          updateStatus(pendingStatus.order, pendingStatus.status)
        }
        onCancelAction={() => setPendingStatus(null)}
      />

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
    </PageShell>
  );
}
