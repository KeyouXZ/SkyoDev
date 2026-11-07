"use client";

import type { ProductFormData } from "@/types/inventory";
import { usePreferences } from "@/context/PreferencesContext";
import { inputCls, labelCls, errorCls } from "./product-form";

interface ProductInventoryFieldsProps {
  form: ProductFormData;
  errors: Partial<Record<keyof ProductFormData, string>>;
  onFieldChangeAction: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
}

export function ProductInventoryFields({
  form,
  errors,
  onFieldChangeAction,
}: ProductInventoryFieldsProps) {
  const { t } = usePreferences();

  return (
    <>
      {/* Inventory Settings */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-500">
          {t("inventory.inventorySettings")}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="product-stock" className={labelCls}>
              {t("inventory.currentStock")}
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              className={inputCls}
              value={Number.isNaN(form.stockLevel) ? "" : form.stockLevel}
              onChange={(e) =>
                onFieldChangeAction("stockLevel", parseInt(e.target.value, 10))
              }
            />
            {errors.stockLevel && (
              <p className={errorCls}>{errors.stockLevel}</p>
            )}
          </div>
          <div>
            <label htmlFor="product-reorder" className={labelCls}>
              {t("inventory.reorderPoint")}
            </label>
            <input
              id="product-reorder"
              type="number"
              min="0"
              className={inputCls}
              value={Number.isNaN(form.reorderPoint) ? "" : form.reorderPoint}
              onChange={(e) =>
                onFieldChangeAction(
                  "reorderPoint",
                  parseInt(e.target.value, 10),
                )
              }
            />
            {errors.reorderPoint && (
              <p className={errorCls}>{errors.reorderPoint}</p>
            )}
          </div>
          <div>
            <label htmlFor="product-leadtime" className={labelCls}>
              {t("inventory.leadTimeDays")}
            </label>
            <input
              id="product-leadtime"
              type="number"
              min="0"
              className={inputCls}
              value={Number.isNaN(form.leadTimeDays) ? "" : form.leadTimeDays}
              onChange={(e) =>
                onFieldChangeAction(
                  "leadTimeDays",
                  parseInt(e.target.value, 10),
                )
              }
            />
            {errors.leadTimeDays && (
              <p className={errorCls}>{errors.leadTimeDays}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="product-description" className={labelCls}>
          {t("inventory.description")}
        </label>
        <textarea
          id="product-description"
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Product details..."
          value={form.description}
          onChange={(e) => onFieldChangeAction("description", e.target.value)}
        />
      </div>
    </>
  );
}
