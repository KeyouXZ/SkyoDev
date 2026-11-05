import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { sendPushNotifications } from "@/lib/notification";
import { forecastDailyDemand, suggestedOrderQuantity } from "@/lib/forecast";
import { z } from "zod";

const SendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  body: z.string().min(1, "Body is required").max(300),
  icon: z.string().optional(),
  url: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * GET /api/notifications
 * Returns notification summary / alerts for the user:
 * - Low stock products count & list
 * - Pending reorder suggestions count & list
 * - Active push subscribers count
 */
export async function GET() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch low stock products (stockLevel <= reorderPoint)
    const lowStockProducts = await prisma.$queryRaw<
      Array<{
        id: number;
        name: string;
        sku: string;
        stockLevel: number;
        reorderPoint: number;
      }>
    >`
      SELECT id, name, sku, "stockLevel", "reorderPoint"
      FROM "Product"
      WHERE "userId" = ${user.id} AND "stockLevel" <= "reorderPoint"
      LIMIT 10
    `;

    // 2. Live reorder suggestions (same formula as /api/forecast so the
    // notification count always matches the Forecast page).
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        sku: true,
        stockLevel: true,
        reorderPoint: true,
        leadTimeDays: true,
      },
      orderBy: { name: "asc" },
    });

    const pendingSuggestions: Array<{
      id: number;
      productId: number;
      suggestedQuantity: number;
      reason: string | null;
      product: { id: number; name: string; sku: string };
    }> = [];
    for (const product of products) {
      const sales = await prisma.sale.findMany({
        where: { userId: user.id, productId: product.id },
        select: { quantity: true, saleDate: true },
        orderBy: { saleDate: "asc" },
      });
      const forecast = forecastDailyDemand(sales, { days: 60, horizon: 30 });
      const { suggestedOrder } = suggestedOrderQuantity(forecast, product);
      if (suggestedOrder > 0) {
        pendingSuggestions.push({
          id: product.id,
          productId: product.id,
          suggestedQuantity: suggestedOrder,
          reason: null,
          product: { id: product.id, name: product.name, sku: product.sku },
        });
      }
    }
    pendingSuggestions.sort(
      (a, b) => b.suggestedQuantity - a.suggestedQuantity,
    );
    const topSuggestions = pendingSuggestions.slice(0, 10);

    // 3. Count active subscribers
    const subscriberCount = await prisma.subscriber.count({
      where: {
        userId: user.id,
      },
    });

    const totalSubscribers = await prisma.subscriber.count();

    return NextResponse.json({
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        pendingSuggestionsCount: topSuggestions.length,
        pendingSuggestions: topSuggestions,
      },
      subscribers: {
        userSubscribers: subscriberCount,
        totalSubscribers,
      },
    });
  } catch (error) {
    console.error("Error fetching notification alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notifications
 * Broadcast or send a push notification (SKT-style web push).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const result = SendNotificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { title, body: contentBody, icon, url, userId } = result.data;

    const payload = {
      title,
      body: contentBody,
      icon: icon ?? "/favicon.ico",
      url: url ?? "/dashboard",
      userId: userId ?? user.id,
    };

    const notifResult = await sendPushNotifications(payload);

    return NextResponse.json(notifResult);
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
