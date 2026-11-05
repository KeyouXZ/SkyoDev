import type { ProductWithSupplier } from "@/types/inventory";

export interface PurchaseOrder {
  id: number;
  status: string;
  createdAt: string;
  items: { quantity: number; product?: { cost: number } | null }[];
}

export interface SaleRecord {
  id: number;
  quantity: number;
  saleDate: string;
  product?: { price: number } | null;
}

export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pending: number;
  draft: number;
  sent: number;
  inventoryValue: number;
  retailValue: number;
  totalUnits: number;
  stockHealth: number;
  criticalProduct: ProductWithSupplier | undefined;
  orderValue: number;
  productsThisMonth: number;
  ordersThisMonth: number;
  salesThisMonth: number;
  salesChangePct: number;
}
