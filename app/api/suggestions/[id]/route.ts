import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { sendPushNotifications } from "@/lib/notification";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/suggestions/[id]
 * Approve or reject suggestion. If approved, automatically drafts a Purchase Order.
 */
export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const suggestionId = parseInt(id, 10);
  if (isNaN(suggestionId)) {
    return NextResponse.json(
      { error: "Invalid suggestion ID" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const result = UpdateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid status", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { status } = result.data;

    const existing = await prisma.reorderSuggestion.findFirst({
      where: { id: suggestionId, userId: user.id },
      include: {
        product: {
          include: { supplier: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 },
      );
    }

    // Update status
    const updated = await prisma.reorderSuggestion.update({
      where: { id: suggestionId },
      data: { status },
      include: { product: true },
    });

    // If approved, create draft purchase order
    let purchaseOrder = null;
    if (status === "approved") {
      purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          userId: user.id,
          status: "draft",
          supplier: existing.product.supplier?.name ?? "Default Supplier",
          notes: `Auto-generated from Approved Reorder Suggestion #${suggestionId}: ${existing.reason}`,
          items: {
            create: [
              {
                productId: existing.productId,
                quantity: existing.suggestedQuantity,
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      // Send push notification
      await sendPushNotifications({
        title: `Reorder Approved: ${existing.product.name}`,
        body: `Suggestion approved. Draft Purchase Order #${purchaseOrder.id} for ${existing.suggestedQuantity} units created.`,
        url: "/purchase-orders",
        userId: user.id,
      }).catch((err) =>
        console.error("Failed to send PO push notification:", err),
      );
    }

    return NextResponse.json({
      suggestion: updated,
      purchaseOrder,
    });
  } catch (error) {
    console.error("Error updating suggestion status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/suggestions/[id]
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
  const suggestionId = parseInt(id, 10);
  if (isNaN(suggestionId)) {
    return NextResponse.json(
      { error: "Invalid suggestion ID" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.reorderSuggestion.findFirst({
      where: { id: suggestionId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 },
      );
    }

    await prisma.reorderSuggestion.delete({
      where: { id: suggestionId },
    });

    return NextResponse.json({
      success: true,
      message: "Suggestion deleted",
      id: suggestionId,
    });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
