export interface ScannedProduct {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  cost: number;
  stockLevel: number;
  reorderPoint: number;
  supplier?: { id: number; name: string; phone?: string | null } | null;
}

export interface ScanResult {
  product: ScannedProduct;
  isLowStock: boolean;
  hasPendingSuggestion: boolean;
}
