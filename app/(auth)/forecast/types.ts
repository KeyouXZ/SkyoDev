export interface ForecastPoint {
  date: string;
  value: number;
  revenue: number;
}

export interface ProductForecast {
  product: {
    id: number;
    name: string;
    sku: string;
    stockLevel: number;
    reorderPoint: number;
    leadTimeDays: number;
  };
  forecast: ForecastPoint[];
  totalDemand: number;
  totalRevenue: number;
  leadTimeDemand: number;
  suggestedOrder: number;
  needsReorder: boolean;
}

export interface ForecastResponse {
  horizon: number;
  generatedAt: string;
  forecasts: ProductForecast[];
}

export interface SaleRecord {
  id: number;
  quantity: number;
  saleDate: string;
  product?: { price: number } | null;
}

export type Metric = "units" | "revenue";

export const HORIZONS = [7, 14, 30];
