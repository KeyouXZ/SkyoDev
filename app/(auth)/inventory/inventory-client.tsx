"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ProductDialog } from "./product-dialog";
import { InventoryToolbar } from "./inventory-toolbar";
import { InventoryTable } from "./inventory-table";
import { InventoryMobileCards } from "./inventory-mobile-cards";
import { exportToCSV } from "@/lib/export-csv";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { CurrentUser } from "@/auth/currentUser";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";

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
  } = useSWR<ProductWithSupplier[]>("/api/products", fetcher, swrOptions);
  const { data: suppliers = [] } = useSWR<SupplierSummary[]>(
    "/api/suppliers",
    fetcher,
    swrOptions,
  );
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
    if (!window.confirm(t("inventory.confirmDelete"))) return;

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
        onEditAction={(prod) => setDialog({ open: true, product: prod })}
        onDeleteAction={handleDelete}
      />

      <InventoryMobileCards
        filtered={filtered}
        loading={loading}
        onEditAction={(prod) => setDialog({ open: true, product: prod })}
        onDeleteAction={handleDelete}
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
