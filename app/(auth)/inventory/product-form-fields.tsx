"use client";

import type { ProductFormData, SupplierSummary } from "@/types/inventory";
import { ProductBasicFields } from "./product-basic-fields";
import { ProductInventoryFields } from "./product-inventory-fields";

interface ProductFormFieldsProps {
  form: ProductFormData;
  errors: Partial<Record<keyof ProductFormData, string>>;
  suppliers: SupplierSummary[];
  onFieldChangeAction: <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => void;
}

export function ProductFormFields({
  form,
  errors,
  suppliers,
  onFieldChangeAction,
}: ProductFormFieldsProps) {
  return (
    <>
      <ProductBasicFields
        form={form}
        errors={errors}
        suppliers={suppliers}
        onFieldChangeAction={onFieldChangeAction}
      />
      <ProductInventoryFields
        form={form}
        errors={errors}
        onFieldChangeAction={onFieldChangeAction}
      />
    </>
  );
}
