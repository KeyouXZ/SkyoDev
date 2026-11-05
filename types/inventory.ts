export interface SupplierSummary {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface ProductWithSupplier {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  /** Price in cents */
  price: number;
  /** Cost in cents */
  cost: number;
  stockLevel: number;
  reorderPoint: number;
  leadTimeDays: number;
  lastRestockDate?: string | null;
  createdAt?: string;
  supplierId?: number | null;
  supplier?: SupplierSummary | null;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  /** Dollars, may be fractional — converted to cents before submit */
  price: number;
  cost: number;
  stockLevel: number;
  reorderPoint: number;
  leadTimeDays: number;
  supplierId: number | null;
}
