import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { forecastDailyDemand } from "@/lib/forecast";

/**
 * GET /api/forecast
 * Demand forecast (Holt-Winters) per product and overall.
 * Query options: horizon (days, default 30), productId (single product)
 */
export async function GET(req: Request) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const horizonParam = searchParams.get("horizon");
  const horizon = horizonParam
    ? Math.min(Math.max(parseInt(horizonParam, 10) || 30, 1), 90)
    : 30;
  const productIdParam = searchParams.get("productId");
  const productId = productIdParam ? parseInt(productIdParam, 10) : undefined;

  try {
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        ...(productId && { id: productId }),
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockLevel: true,
        reorderPoint: true,
        leadTimeDays: true,
        price: true,
        cost: true,
      },
      orderBy: { name: "asc" },
    });

    const forecasts = [];
    for (const product of products) {
      const sales = await prisma.sale.findMany({
        where: { userId: user.id, productId: product.id },
        select: { quantity: true, saleDate: true },
        orderBy: { saleDate: "asc" },
      });

      const forecast = forecastDailyDemand(sales, {
        days: 60,
        horizon,
      });

      const priceDollars = product.price / 100;
      const forecastWithRevenue = forecast.map((f) => ({
        ...f,
        revenue: Number((f.value * priceDollars).toFixed(2)),
      }));

      const totalDemand = forecast.reduce((sum, f) => sum + f.value, 0);
      const totalRevenue = forecastWithRevenue.reduce(
        (sum, f) => sum + f.revenue,
        0,
      );
      // Demand expected during the lead time.
      const leadTimeDemand = forecast
        .slice(0, product.leadTimeDays)
        .reduce((sum, f) => sum + f.value, 0);
      const suggestedOrder = Math.max(
        0,
        Math.ceil(leadTimeDemand + product.reorderPoint - product.stockLevel),
      );

      forecasts.push({
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          stockLevel: product.stockLevel,
          reorderPoint: product.reorderPoint,
          leadTimeDays: product.leadTimeDays,
          price: product.price,
          cost: product.cost,
        },
        forecast: forecastWithRevenue,
        totalDemand: Number(totalDemand.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        leadTimeDemand: Number(leadTimeDemand.toFixed(2)),
        suggestedOrder,
        needsReorder: suggestedOrder > 0,
      });
    }

    return NextResponse.json({
      horizon,
      generatedAt: new Date().toISOString(),
      forecasts,
    });
  } catch (error) {
    console.error("Error generating forecast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
