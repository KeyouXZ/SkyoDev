import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/sales/[id]
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
  const saleId = parseInt(id, 10);
  if (isNaN(saleId)) {
    return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
  }

  try {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, userId: user.id },
      include: {
        product: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Sale record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error fetching sale record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/sales/[id]
 * Cancels a sale and restores the deducted stock back to the product.
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
  const saleId = parseInt(id, 10);
  if (isNaN(saleId)) {
    return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
  }

  try {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, userId: user.id },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Sale record not found" },
        { status: 404 },
      );
    }

    // Atomically restore product stock and delete the sale
    await prisma.$transaction([
      prisma.product.update({
        where: { id: sale.productId },
        data: {
          stockLevel: { increment: sale.quantity },
        },
      }),
      prisma.sale.delete({
        where: { id: saleId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Sale cancelled and stock restored",
      id: saleId,
    });
  } catch (error) {
    console.error("Error cancelling sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
