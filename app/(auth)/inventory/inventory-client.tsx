"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Box, Download, Plus, Search } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { ProductDialog } from "./product-dialog";
import { RowActions } from "./row-actions";
import { exportToCSV } from "@/lib/export-csv";
import { fetcher, swrOptions } from "@/lib/fetcher";
import type { CurrentUser } from "@/auth/currentUser";
import type { ProductWithSupplier, SupplierSummary } from "@/types/inventory";

interface Props {
  user?: CurrentUser;
}

type DialogState = { open: boolean; product: ProductWithSupplier | null };

export default function InventoryPageClient({ user }: Props) {
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
      : "Something went wrong"
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
        "Price ($)": (p.price / 100).toFixed(2),
        "Cost ($)": (p.cost / 100).toFixed(2),
        "Lead Time (days)": p.leadTimeDays ?? "",
      })),
      "inventory",
    );
    toast.success("Export ready", {
      description: `${filtered.length} products exported to CSV.`,
    });
  };

  const handleDelete = async (product: ProductWithSupplier) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete product");
      }
      await mutateProducts(
        (current) => (current ?? []).filter((p) => p.id !== product.id),
        { revalidate: true },
      );
      toast.success("Product deleted", {
        description: `${product.name} has been removed.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error("Could not delete product", { description: message });
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skeletonRow = (key: number) => (
    <tr key={key} className="border-b border-gray-50">
      <td className="px-4 py-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="h-4 w-12 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="ml-auto h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <Header
            title="Inventory"
            setSidebarOpen={setSidebarOpen}
            user={user}
          />

          {/* Toolbar */}
          <div className="mb-5 mt-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-72 z-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-products"
                />
              </div>

              {/* Low Stock toggle */}
              <button
                onClick={() => setLowStockOnly((v) => !v)}
                data-testid="button-filter-low-stock"
                className={`flex cursor-pointer items-center rounded-xl px-3 py-2 text-sm font-medium shadow-xs transition-all ${
                  lowStockOnly
                    ? "bg-[#00a2be] text-white hover:bg-[#008ea6]"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <AlertTriangle className="mr-1.5 h-4 w-4" />
                Low Stock
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export */}
              <button
                onClick={handleExport}
                disabled={!filtered.length}
                data-testid="button-export-inventory"
                className="flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>

              {/* Add Product */}
              <button
                onClick={() => setDialog({ open: true, product: null })}
                data-testid="button-add-product"
                className="flex cursor-pointer items-center rounded-xl bg-[#00a2be] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#008ea6]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Error banner */}
          {loadError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {loadError}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-[#f1f7fb]">
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Product Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      SKU
                    </th>
                    <th className="hidden px-4 py-3 font-semibold text-gray-700 md:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Stock
                    </th>
                    <th className="hidden px-4 py-3 font-semibold text-gray-700 lg:table-cell">
                      Reorder Pt
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => skeletonRow(i))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        {products.length === 0
                          ? "No products found. Add your first product to get started."
                          : "No products match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const isLow = p.stockLevel <= p.reorderPoint;
                      return (
                        <tr
                          key={p.id}
                          className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {p.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {p.sku}
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-normal text-gray-500">
                              {p.category || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  isLow
                                    ? "font-bold text-red-600"
                                    : "text-gray-800"
                                }
                              >
                                {p.stockLevel}
                              </span>
                              {isLow && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                            {p.reorderPoint}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            ${(p.price / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <RowActions
                              product={p}
                              testPrefix="button-actions"
                              onEditAction={(prod) =>
                                setDialog({ open: true, product: prod })
                              }
                              onDeleteAction={handleDelete}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 sm:hidden">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-24 w-full animate-pulse rounded-xl bg-white/70"
                  />
                ))
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/60 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
                No products found. Add your first product to get started.
              </div>
            ) : (
              filtered.map((p) => {
                const isLow = p.stockLevel <= p.reorderPoint;
                return (
                  <div
                    key={p.id}
                    data-testid={`card-product-${p.id}`}
                    className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00a2be]/10">
                          <Box className="h-4 w-4 text-[#00a2be]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {p.name}
                          </p>
                          <p className="font-mono text-xs text-gray-500">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                      <RowActions
                        product={p}
                        testPrefix="button-actions-mobile"
                        onEditAction={(prod) =>
                          setDialog({ open: true, product: prod })
                        }
                        onDeleteAction={handleDelete}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Stock:</span>
                        <span
                          className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}
                        >
                          {p.stockLevel}
                        </span>
                        {isLow && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Price: </span>
                        <span className="font-semibold text-gray-900">
                          ${(p.price / 100).toFixed(2)}
                        </span>
                      </div>
                      {p.category && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-gray-500">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

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
    </div>
  );
}
