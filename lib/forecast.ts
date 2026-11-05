/**
 * Sales forecasting via linear regression with day-of-week seasonality.
 *
 * Pure TypeScript, no dependencies — runs in Vercel serverless functions.
 *
 * Method:
 *  1. Fit a linear trend (least squares) through daily sales.
 *  2. Average the residuals per weekday to capture day-of-week seasonality.
 *  3. Forecast = trend projection + that weekday's seasonal offset.
 */

export interface ForecastPoint {
  date: string; // YYYY-MM-DD
  value: number; // predicted units
}

interface LinearRegression {
  slope: number;
  intercept: number;
}

/** Ordinary least squares fit of y = intercept + slope * x. */
function linearRegression(xs: number[], ys: number[]): LinearRegression {
  const n = xs.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * Forecast the next `horizon` daily values from a daily series using
 * linear regression with day-of-week seasonality.
 */
export function linearRegressionForecast(
  data: number[],
  options: { seasonLength?: number; horizon?: number } = {},
): number[] {
  const { seasonLength = 7, horizon = 30 } = options;
  const n = data.length;
  if (n === 0) return new Array(horizon).fill(0);

  // x = 0..n-1 (days since start of series).
  const xs = data.map((_, i) => i);
  const { slope, intercept } = linearRegression(xs, data);

  // Seasonal component: average residual per weekday.
  const seasonal = new Array(seasonLength).fill(0);
  const counts = new Array(seasonLength).fill(0);
  for (let i = 0; i < n; i++) {
    const trend = intercept + slope * i;
    const dow = i % seasonLength;
    seasonal[dow] += data[i] - trend;
    counts[dow] += 1;
  }
  for (let d = 0; d < seasonLength; d++) {
    seasonal[d] = counts[d] > 0 ? seasonal[d] / counts[d] : 0;
  }

  // Project forward.
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const x = n - 1 + h;
    const dow = x % seasonLength;
    forecast.push(Math.max(0, intercept + slope * x + seasonal[dow]));
  }
  return forecast;
}

/**
 * Build a daily series (oldest → newest) of length `days` from dated sales,
 * then forecast the next `horizon` days. Returns dated forecast points.
 */
export function forecastDailyDemand(
  sales: { quantity: number; saleDate: string | Date }[],
  options: { days?: number; horizon?: number } = {},
): ForecastPoint[] {
  const { days = 60, horizon = 30 } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bucket sales by day.
  const byDay = new Map<string, number>();
  for (const s of sales) {
    const d = new Date(s.saleDate);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + s.quantity);
  }

  // Build the daily series ending today.
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    series.push(byDay.get(d.toISOString().slice(0, 10)) ?? 0);
  }

  const values = linearRegressionForecast(series, { horizon });

  return values.map((value, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return {
      date: d.toISOString().slice(0, 10),
      value: Number(value.toFixed(2)),
    };
  });
}

/**
 * Suggested reorder quantity for a product given its forecast.
 * Shared by /api/forecast and /api/notifications so both show the same number.
 */
export function suggestedOrderQuantity(
  forecast: ForecastPoint[],
  product: { stockLevel: number; reorderPoint: number; leadTimeDays: number },
): { suggestedOrder: number; leadTimeDemand: number } {
  const leadTimeDemand = forecast
    .slice(0, product.leadTimeDays)
    .reduce((sum, f) => sum + f.value, 0);
  const suggestedOrder = Math.max(
    0,
    Math.ceil(leadTimeDemand + product.reorderPoint - product.stockLevel),
  );
  return { suggestedOrder, leadTimeDemand };
}
