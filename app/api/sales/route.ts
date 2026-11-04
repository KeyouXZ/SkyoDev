import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { sendPushNotifications } from "@/lib/notification";
import { z } from "zod";

const RecordSaleSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  saleDate: z.string().datetime().optional(),
});

/**
 * GET /api/sales
 * List recent sales with product info. Optional query: productId, limit
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
  const productId = searchParams.get("productId")
    ? parseInt(searchParams.get("productId")!, 10)
    : undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : 50;

  try {
    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        ...(productId && { productId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stockLevel: true,
            reorderPoint: true,
          },
        },
      },
      orderBy: { saleDate: "desc" },
      take: limit,
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/sales
 * Record a sale: decrements inventory stock level and triggers low-stock alerts.
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
    const result = RecordSaleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid sale data", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { productId, quantity, saleDate } = result.data;

    // Check product ownership and stock availability
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stockLevel < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock: only ${product.stockLevel} units available, requested ${quantity}`,
        },
        { status: 400 },
      );
    }

    // Execute atomic sale & stock decrement
    const [sale, updatedProduct] = await prisma.$transaction([
      prisma.sale.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          ...(saleDate && { saleDate: new Date(saleDate) }),
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, price: true },
          },
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          stockLevel: { decrement: quantity },
        },
      }),
    ]);

    // Check if stock dropped to or below reorderPoint
    if (updatedProduct.stockLevel <= updatedProduct.reorderPoint) {
      // 1. Create or check existing pending reorder suggestion
      const existingSuggestion = await prisma.reorderSuggestion.findFirst({
        where: {
          productId,
          userId: user.id,
          status: "pending",
        },
      });

      if (!existingSuggestion) {
        const suggestedQty = Math.max(
          updatedProduct.reorderPoint * 2 - updatedProduct.stockLevel,
          10,
        );
        await prisma.reorderSuggestion.create({
          data: {
            userId: user.id,
            productId,
            suggestedQuantity: suggestedQty,
            reason: `Stock fell to ${updatedProduct.stockLevel} (reorder point: ${updatedProduct.reorderPoint}) following sale #${sale.id}.`,
            status: "pending",
          },
        });
      }

      // 2. Dispatch push notification
      await sendPushNotifications({
        title: `Low Stock Alert: ${updatedProduct.name}`,
        body: `Stock for ${updatedProduct.name} fell to ${updatedProduct.stockLevel} (reorder point: ${updatedProduct.reorderPoint}). Reorder suggestion has been generated.`,
        url: "/inventory",
        userId: user.id,
      }).catch((err) =>
        console.error("Failed to send sale low-stock push notification:", err),
      );
    }

    return NextResponse.json(
      {
        sale,
        currentStock: updatedProduct.stockLevel,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
