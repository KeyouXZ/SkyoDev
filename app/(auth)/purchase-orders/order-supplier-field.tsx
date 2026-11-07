"use client";

import { usePreferences } from "@/context/PreferencesContext";
import type { SupplierSummary } from "@/types/inventory";

export function OrderSupplierField({
  supplier,
  suppliers,
  onSupplierChangeAction,
}: {
  supplier: string;
  suppliers: SupplierSummary[];
  onSupplierChangeAction: (value: string) => void;
}) {
  const { t } = usePreferences();
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {t("purchaseOrders.supplier")}
      </label>
      <select
        value={supplier}
        onChange={(e) => onSupplierChangeAction(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
      >
        <option value="">{t("purchaseOrders.selectSupplier")}</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      {suppliers.length === 0 && (
        <p className="mt-1.5 text-xs text-gray-400">
          {t("purchaseOrders.noSuppliers")}
        </p>
      )}
    </div>
  );
}
