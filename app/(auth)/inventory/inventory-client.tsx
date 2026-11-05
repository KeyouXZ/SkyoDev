"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductDialog } from "./product-dialog";
import { InventoryToolbar } from "./inventory-toolbar";
import { InventoryTable } from "./inventory-table";
import { InventoryMobileCards } from "./inventory-mobile-cards";
import { exportToCSV } from "@/lib/export-csv";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { CurrentUser } from "@/auth/currentUser";
import type { ProductWithSupplier } from "@/types/inventory";

interface Props {
  user?: CurrentUser;
}

type DialogState = { open: boolean; product: ProductWithSupplier | null };

export default function InventoryPageClient({ user }: Props) {
  const { t, currency } = usePreferences();
  const searchParams = useSearchParams();

  const {
    data: products = [],
    mutate: mutateProducts,
    isLoading: loading,
    error: productsError,
  } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const loadError = productsError
    ? productsError instanceof Error
      ? productsError.message
      : t("inventory.somethingWentWrong")
    : null;

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(
    () => searchParams.get("filter") === "low-stock",
  );

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    product: null,
  });
  const [pendingDelete, setPendingDelete] =
    useState<ProductWithSupplier | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtering
  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchesLowStock = lowStockOnly
      ? p.stockLevel <= p.reorderPoint
      : true;
    return matchesSearch && matchesLowStock;
  });

  const handleExport = () => {
    exportToCSV(
      filtered.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Category: p.category ?? "",
        "Stock Level": p.stockLevel,
        "Reorder Point": p.reorderPoint,
        Price: formatCurrency(p.price, currency),
        Cost: formatCurrency(p.cost, currency),
        "Lead Time (days)": p.leadTimeDays ?? "",
      })),
      "inventory",
    );
    toast.success(t("inventory.exportReady"), {
      description: t("inventory.productsExported", { count: filtered.length }),
    });
  };

  const handleDelete = async (product: ProductWithSupplier) => {
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("inventory.failedToDelete"));
      }
      await mutateProducts(
        (current) => (current ?? []).filter((p) => p.id !== product.id),
        { revalidate: true },
      );
      toast.success(t("inventory.productDeleted"), {
        description: `${product.name} has been removed.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("inventory.somethingWentWrong");
      toast.error(t("inventory.couldNotDelete"), { description: message });
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <PageShell title={t("inventory.title")} user={user}>
      <InventoryToolbar
        search={search}
        onSearchChangeAction={setSearch}
        lowStockOnly={lowStockOnly}
        onLowStockToggleAction={() => setLowStockOnly((v) => !v)}
        onExportAction={handleExport}
        exportDisabled={!filtered.length}
        onAddProductAction={() => setDialog({ open: true, product: null })}
      />

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </div>
      )}

      <InventoryTable
        products={products}
        filtered={filtered}
        loading={loading}
        deletingId={deletingId}
        onEditAction={(prod) => setDialog({ open: true, product: prod })}
        onDeleteAction={setPendingDelete}
      />

      <InventoryMobileCards
        filtered={filtered}
        loading={loading}
        deletingId={deletingId}
        onEditAction={(prod) => setDialog({ open: true, product: prod })}
        onDeleteAction={setPendingDelete}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("common.delete")}
        message={`${t("inventory.confirmDelete")} (${pendingDelete?.name ?? ""})`}
        busy={deletingId !== null}
        onConfirmAction={() => pendingDelete && handleDelete(pendingDelete)}
        onCancelAction={() => setPendingDelete(null)}
      />

      {/* Add / Edit Product Dialog  */}
      <ProductDialog
        key={dialog.product?.id ?? "new"}
        open={dialog.open}
        product={dialog.product}
        suppliers={suppliers}
        onOpenChange={(open) =>
          setDialog((d) => ({ ...d, open, product: open ? d.product : null }))
        }
        onSaved={() => mutateProducts()}
      />
    </PageShell>
  );
}
