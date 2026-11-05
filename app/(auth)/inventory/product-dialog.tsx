"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type {
  ProductFormData,
  ProductWithSupplier,
  SupplierSummary,
} from "@/types/inventory";
import { toFormValues, validate } from "./product-form";
import { ProductFormFields } from "./product-form-fields";
import { usePreferences } from "@/context/PreferencesContext";

interface ProductDialogProps {
  open: boolean;
  product: ProductWithSupplier | null;
  suppliers: SupplierSummary[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ProductDialog({
  open,
  product,
  suppliers,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const { t } = usePreferences();
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
    const nextErrors = validate(form, t);
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
        throw new Error(data?.error ?? t("inventory.failedToSave"));
      }

      onSaved();

      toast.success(
        isEdit ? t("inventory.productUpdated") : t("inventory.productCreated"),
        {
          description: `${form.name.trim()} has been saved.`,
        },
      );

      setForm(toFormValues(null));
      setErrors({});
      setServerError(null);

      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("inventory.somethingWentWrong");
      setServerError(message);
      toast.error(t("inventory.couldNotSave"), { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      key={product?.id ?? "new"}
      className="fixed inset-0 z-60 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative m-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl duration-150 sm:max-w-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {isEdit ? t("inventory.editProduct") : t("inventory.addNewProduct")}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("common.close")}
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

          <ProductFormFields
            form={form}
            errors={errors}
            suppliers={suppliers}
            onFieldChangeAction={setField}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting
                ? isEdit
                  ? t("inventory.saving")
                  : t("inventory.creating")
                : isEdit
                  ? t("common.save")
                  : t("inventory.createProduct")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
