export interface SaleRecord {
  id: number;
  quantity: number;
  saleDate: string;
  product?: { id: number; name: string; sku: string; price: number } | null;
}

export type Tab = "record" | "recent";
