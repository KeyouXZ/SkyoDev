import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { sendPushNotifications } from "@/lib/notification";
import { z } from "zod";

const CreatePurchaseOrderSchema = z.object({
  supplier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "received"]).default("draft"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive("Product ID is required"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

/**
 * GET /api/purchase-orders
 * List purchase orders. Query options: status ('draft' | 'sent' | 'received')
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
  const status = searchParams.get("status") || undefined;

  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                cost: true,
                price: true,
                stockLevel: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/purchase-orders
 * Create a new purchase order with line items.
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
    const result = CreatePurchaseOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid purchase order data", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { supplier, notes, status, items } = result.data;

    // Verify all products belong to user
    const productIds = items.map((i) => i.productId);
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: user.id,
      },
      select: { id: true },
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more products do not exist or belong to another account",
        },
        { status: 400 },
      );
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        userId: user.id,
        supplier,
        notes,
        status,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    // Notify user of new purchase order
    await sendPushNotifications({
      title: `Purchase Order Created (#${order.id})`,
      body: `PO #${order.id} for ${items.length} items created (Status: ${status}).`,
      url: "/purchase-orders",
      userId: user.id,
    }).catch((err) =>
      console.error("Failed to send PO creation push notification:", err),
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
