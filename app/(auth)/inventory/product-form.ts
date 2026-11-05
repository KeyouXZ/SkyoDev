import type { ProductFormData, ProductWithSupplier } from "@/types/inventory";

export const defaultForm: ProductFormData = {
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

export function toFormValues(
  product: ProductWithSupplier | null,
): ProductFormData {
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

export function validate(
  form: ProductFormData,
  t?: (path: string) => string,
): Partial<Record<keyof ProductFormData, string>> {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  const msg = (key: string, fallback: string) => t?.(key) ?? fallback;
  if (!form.name.trim())
    errors.name = msg("inventory.nameRequired", "Name is required");
  if (!form.sku.trim())
    errors.sku = msg("inventory.skuRequired", "SKU is required");
  if (Number.isNaN(form.price) || form.price < 0)
    errors.price = msg("inventory.pricePositive", "Price must be positive");
  if (Number.isNaN(form.cost) || form.cost < 0)
    errors.cost = msg("inventory.costPositive", "Cost must be positive");
  if (Number.isNaN(form.stockLevel) || form.stockLevel < 0)
    errors.stockLevel = msg("inventory.mustBeAtLeast0", "Must be at least 0");
  if (Number.isNaN(form.reorderPoint) || form.reorderPoint < 0)
    errors.reorderPoint = msg("inventory.mustBeAtLeast0", "Must be at least 0");
  if (Number.isNaN(form.leadTimeDays) || form.leadTimeDays < 0)
    errors.leadTimeDays = msg("inventory.mustBeAtLeast0", "Must be at least 0");
  return errors;
}

export const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20";
export const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";
export const errorCls = "mt-1 text-xs font-medium text-red-600";
