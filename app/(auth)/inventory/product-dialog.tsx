"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type {
  ProductFormData,
  ProductWithSupplier,
  SupplierSummary,
} from "@/types/inventory";

interface ProductDialogProps {
  open: boolean;
  product: ProductWithSupplier | null;
  suppliers: SupplierSummary[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const defaultForm: ProductFormData = {
  name: "",
  sku: "",
  description: "",
  category: "",
  price: 0,
  cost: 0,
  stockLevel: 0,
  reorderPoint: 10,
  leadTimeDays: 7,
  supplierId: null,
};

function toFormValues(product: ProductWithSupplier | null): ProductFormData {
  if (!product) return { ...defaultForm };
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? "",
    category: product.category ?? "",
    price: product.price / 100,
    cost: product.cost / 100,
    stockLevel: product.stockLevel,
    reorderPoint: product.reorderPoint,
    leadTimeDays: product.leadTimeDays ?? 7,
    supplierId: product.supplierId ?? null,
  };
}

function validate(
  form: ProductFormData,
): Partial<Record<keyof ProductFormData, string>> {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (Number.isNaN(form.price) || form.price < 0)
    errors.price = "Price must be positive";
  if (Number.isNaN(form.cost) || form.cost < 0)
    errors.cost = "Cost must be positive";
  if (Number.isNaN(form.stockLevel) || form.stockLevel < 0)
    errors.stockLevel = "Must be at least 0";
  if (Number.isNaN(form.reorderPoint) || form.reorderPoint < 0)
    errors.reorderPoint = "Must be at least 0";
  if (Number.isNaN(form.leadTimeDays) || form.leadTimeDays < 0)
    errors.leadTimeDays = "Must be at least 0";
  return errors;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";
const errorCls = "mt-1 text-xs font-medium text-red-600";

export function ProductDialog({
  open,
  product,
  suppliers,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductFormData>(() =>
    toFormValues(product),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  const setField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      price: Math.round(form.price * 100),
      cost: Math.round(form.cost * 100),
      stockLevel: Math.round(form.stockLevel),
      reorderPoint: Math.round(form.reorderPoint),
      leadTimeDays: Math.round(form.leadTimeDays),
      supplierId: form.supplierId,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/products/${product.id}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save product");
      }

      onSaved();

      setForm(toFormValues(null));
      setErrors({});
      setServerError(null);

      onOpenChange(false);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      key={product?.id ?? "new"}
      className="fixed inset-0 z-60 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative m-0 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl duration-150 sm:m-4 sm:max-w-150 sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-5 py-5"
        >
          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="product-name" className={labelCls}>
                Product Name
              </label>
              <input
                id="product-name"
                className={inputCls}
                placeholder="Premium Widget"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                maxLength={150}
              />
              {errors.name && <p className={errorCls}>{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="product-sku" className={labelCls}>
                SKU
              </label>
              <input
                id="product-sku"
                className={inputCls}
                placeholder="WID-001"
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                maxLength={50}
              />
              {errors.sku && <p className={errorCls}>{errors.sku}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="product-category" className={labelCls}>
                Category
              </label>
              <input
                id="product-category"
                className={inputCls}
                placeholder="Electronics"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Supplier */}
            <div>
              <label htmlFor="product-supplier" className={labelCls}>
                Supplier
              </label>
              <select
                id="product-supplier"
                className={inputCls}
                value={form.supplierId ?? ""}
                onChange={(e) =>
                  setField(
                    "supplierId",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              >
                <option value="">No supplier</option>
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
                Price ($)
              </label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                placeholder="0.01"
                value={Number.isNaN(form.price) ? "" : form.price}
                onChange={(e) => setField("price", parseFloat(e.target.value))}
              />
              {errors.price && <p className={errorCls}>{errors.price}</p>}
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="product-cost" className={labelCls}>
                Cost ($)
              </label>
              <input
                id="product-cost"
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                placeholder="0.01"
                value={Number.isNaN(form.cost) ? "" : form.cost}
                onChange={(e) => setField("cost", parseFloat(e.target.value))}
              />
              {errors.cost && <p className={errorCls}>{errors.cost}</p>}
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="mb-4 text-sm font-semibold text-gray-500">
              Inventory Settings
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="product-stock" className={labelCls}>
                  Current Stock
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  className={inputCls}
                  value={Number.isNaN(form.stockLevel) ? "" : form.stockLevel}
                  onChange={(e) =>
                    setField("stockLevel", parseInt(e.target.value, 10))
                  }
                />
                {errors.stockLevel && (
                  <p className={errorCls}>{errors.stockLevel}</p>
                )}
              </div>
              <div>
                <label htmlFor="product-reorder" className={labelCls}>
                  Reorder Point
                </label>
                <input
                  id="product-reorder"
                  type="number"
                  min="0"
                  className={inputCls}
                  value={
                    Number.isNaN(form.reorderPoint) ? "" : form.reorderPoint
                  }
                  onChange={(e) =>
                    setField("reorderPoint", parseInt(e.target.value, 10))
                  }
                />
                {errors.reorderPoint && (
                  <p className={errorCls}>{errors.reorderPoint}</p>
                )}
              </div>
              <div>
                <label htmlFor="product-leadtime" className={labelCls}>
                  Lead Time (Days)
                </label>
                <input
                  id="product-leadtime"
                  type="number"
                  min="0"
                  className={inputCls}
                  value={
                    Number.isNaN(form.leadTimeDays) ? "" : form.leadTimeDays
                  }
                  onChange={(e) =>
                    setField("leadTimeDays", parseInt(e.target.value, 10))
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
              Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Product details..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
