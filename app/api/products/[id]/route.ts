import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { sendPushNotifications } from "@/lib/notification";
import { z } from "zod";

const UpdateProductSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  price: z.number().int().min(0).optional(),
  cost: z.number().int().min(0).optional(),
  stockLevel: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  leadTimeDays: z.number().int().min(0).optional(),
  supplierId: z.number().int().optional().nullable(),
  lastRestockDate: z.string().datetime().optional().nullable(),
});

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/products/[id]
 */
export async function GET(_req: Request, { params }: Context) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
      include: {
        supplier: true,
        sales: {
          orderBy: { saleDate: "desc" },
          take: 10,
        },
        reorderSuggestions: {
          where: { status: "pending" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 */
export async function PUT(req: Request, { params }: Context) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = UpdateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid update data", issues: result.error.issues },
        { status: 400 },
      );
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData = { ...result.data };
    const lastRestockDate = updateData.lastRestockDate
      ? new Date(updateData.lastRestockDate)
      : undefined;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        ...(lastRestockDate && { lastRestockDate }),
      },
      include: {
        supplier: true,
      },
    });

    // Check if stock dropped below reorder point
    if (
      updated.stockLevel <= updated.reorderPoint &&
      existing.stockLevel > existing.reorderPoint
    ) {
      await sendPushNotifications({
        title: `Low Stock Alert: ${updated.name}`,
        body: `Stock for ${updated.name} dropped to ${updated.stockLevel} (reorder point: ${updated.reorderPoint}).`,
        url: "/inventory",
        userId: user.id,
      }).catch((err) =>
        console.error("Failed to send low stock notification:", err),
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 */
export async function DELETE(_req: Request, { params }: Context) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      id: productId,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
