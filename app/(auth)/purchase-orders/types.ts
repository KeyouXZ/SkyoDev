export type OrderStatus = "draft" | "sent" | "received";
export type StatusFilter = "all" | OrderStatus;

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    cost: number;
    price: number;
    stockLevel: number;
  } | null;
}

export interface PurchaseOrder {
  id: number;
  status: OrderStatus;
  supplier?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface DraftItem {
  productId: number;
  quantity: number;
}

export const STATUS_STYLES: Record<OrderStatus, string> = {
  draft: "bg-slate-100 text-gray-600",
  sent: "bg-amber-100 text-amber-700",
  received: "bg-emerald-100 text-emerald-700",
};
