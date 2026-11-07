"use client";

import type { ProductFormData, SupplierSummary } from "@/types/inventory";
import { usePreferences } from "@/context/PreferencesContext";
import { getExchangeRate } from "@/lib/exchange-rate";
import { inputCls, labelCls, errorCls } from "./product-form";

interface ProductBasicFieldsProps {
  form: ProductFormData;
  errors: Partial<Record<keyof ProductFormData, string>>;
  suppliers: SupplierSummary[];
  onFieldChangeAction: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
}

export function ProductBasicFields({
  form,
  errors,
  suppliers,
  onFieldChangeAction,
}: ProductBasicFieldsProps) {
  const { t, currency } = usePreferences();
  const isIDR = currency === "IDR";
  const toDisplay = (dollars: number) =>
    Number.isNaN(dollars)
      ? ""
      : isIDR
        ? Math.round(dollars * getExchangeRate())
        : dollars;
  const fromDisplay = (raw: string) => {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return NaN;
    return isIDR ? n / getExchangeRate() : n;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Name */}
      <div className="col-span-1 sm:col-span-2">
        <label htmlFor="product-name" className={labelCls}>
          {t("inventory.productNameLabel")}
        </label>
        <input
          id="product-name"
          className={inputCls}
          placeholder="Premium Widget"
          value={form.name}
          onChange={(e) => onFieldChangeAction("name", e.target.value)}
          maxLength={150}
        />
        {errors.name && <p className={errorCls}>{errors.name}</p>}
      </div>

      {/* SKU */}
      <div>
        <label htmlFor="product-sku" className={labelCls}>
          {t("inventory.sku")}
        </label>
        <input
          id="product-sku"
          className={inputCls}
          placeholder="WID-001"
          value={form.sku}
          onChange={(e) => onFieldChangeAction("sku", e.target.value)}
          maxLength={50}
        />
        {errors.sku && <p className={errorCls}>{errors.sku}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="product-category" className={labelCls}>
          {t("inventory.category")}
        </label>
        <input
          id="product-category"
          className={inputCls}
          placeholder="Electronics"
          value={form.category}
          onChange={(e) => onFieldChangeAction("category", e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Supplier */}
      <div>
        <label htmlFor="product-supplier" className={labelCls}>
          {t("inventory.supplier")}
        </label>
        <select
          id="product-supplier"
          className={inputCls}
          value={form.supplierId ?? ""}
          onChange={(e) =>
            onFieldChangeAction(
              "supplierId",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        >
          <option value="">{t("inventory.noSupplier")}</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="product-price" className={labelCls}>
          {t("inventory.priceLabel")} {isIDR ? "(Rp)" : "($)"}
        </label>
        <input
          id="product-price"
          type="number"
          step={isIDR ? "1" : "0.01"}
          min="0"
          className={inputCls}
          placeholder={isIDR ? "0" : "0.01"}
          value={toDisplay(form.price)}
          onChange={(e) =>
            onFieldChangeAction("price", fromDisplay(e.target.value))
          }
        />
        {errors.price && <p className={errorCls}>{errors.price}</p>}
      </div>

      {/* Cost */}
      <div>
        <label htmlFor="product-cost" className={labelCls}>
          {t("inventory.costLabel")} {isIDR ? "(Rp)" : "($)"}
        </label>
        <input
          id="product-cost"
          type="number"
          step={isIDR ? "1" : "0.01"}
          min="0"
          className={inputCls}
          placeholder={isIDR ? "0" : "0.01"}
          value={toDisplay(form.cost)}
          onChange={(e) =>
            onFieldChangeAction("cost", fromDisplay(e.target.value))
          }
        />
        {errors.cost && <p className={errorCls}>{errors.cost}</p>}
      </div>
    </div>
  );
}
