"use client";

import { AlertTriangle } from "lucide-react";
import { RowActions } from "./row-actions";
import { usePreferences } from "@/context/PreferencesContext";
import { formatCurrency } from "@/lib/format";
import type { ProductWithSupplier } from "@/types/inventory";

function SkeletonRow({ rowKey }: { rowKey: number }) {
  return (
    <tr key={rowKey} className="border-b border-gray-50">
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
}

interface InventoryTableProps {
  products: ProductWithSupplier[];
  filtered: ProductWithSupplier[];
  loading: boolean;
  onEditAction: (product: ProductWithSupplier) => void;
  onDeleteAction: (product: ProductWithSupplier) => void;
}

export function InventoryTable({
  products,
  filtered,
  loading,
  onEditAction,
  onDeleteAction,
}: InventoryTableProps) {
  const { t, currency } = usePreferences();
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm sm:block">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-[#f1f7fb]">
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">
                {t("inventory.productName")}
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                {t("inventory.sku")}
              </th>
              <th className="hidden px-4 py-3 font-semibold text-gray-700 md:table-cell">
                {t("inventory.category")}
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                {t("inventory.stock")}
              </th>
              <th className="hidden px-4 py-3 font-semibold text-gray-700 lg:table-cell">
                {t("inventory.reorderPt")}
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                {t("inventory.price")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                {t("inventory.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <SkeletonRow key={i} rowKey={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  {products.length === 0
                    ? t("inventory.noProducts")
                    : t("inventory.noMatch")}
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
                        {p.category || t("inventory.uncategorized")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isLow ? "font-bold text-red-600" : "text-gray-800"
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
                      {formatCurrency(p.price, currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowActions
                        product={p}
                        testPrefix="button-actions"
                        onEditAction={onEditAction}
                        onDeleteAction={onDeleteAction}
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
  );
}
