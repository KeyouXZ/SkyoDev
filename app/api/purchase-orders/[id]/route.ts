import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';
import { sendPushNotifications } from '@/lib/notification';
import { z } from 'zod';

const UpdateOrderSchema = z.object({
  status: z.enum(['draft', 'sent', 'received']).optional(),
  supplier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/purchase-orders/[id]
 */
export async function GET(_req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid purchase order ID' }, { status: 400 });
  }

  try {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: { supplier: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/purchase-orders/[id]
 * Update status or metadata. If transitioning to "received", automatically increments inventory.
 */
export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid purchase order ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = UpdateOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid update data', issues: result.error.issues }, { status: 400 });
    }

    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    const { status, supplier, notes } = result.data;
    const isReceiving = status === 'received' && existing.status !== 'received';

    let updatedOrder;

    if (isReceiving) {
      const now = new Date();
      // Transaction to update order and increment stock levels
      const txResults = await prisma.$transaction([
        prisma.purchaseOrder.update({
          where: { id: orderId },
          data: {
            ...(status && { status }),
            ...(supplier !== undefined && { supplier }),
            ...(notes !== undefined && { notes }),
          },
          include: { items: { include: { product: true } } },
        }),
        ...existing.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stockLevel: { increment: item.quantity },
              lastRestockDate: now,
            },
          })
        ),
      ]);

      updatedOrder = txResults[0];

      // Dispatch restock push notification
      await sendPushNotifications({
        title: `Restock Received: PO #${orderId}`,
        body: `Purchase order #${orderId} marked as received. ${existing.items.length} product(s) restocked.`,
        url: '/inventory',
        userId: user.id,
      }).catch((err) => console.error('Failed to send PO restock push notification:', err));
    } else {
      updatedOrder = await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: {
          ...(status && { status }),
          ...(supplier !== undefined && { supplier }),
          ...(notes !== undefined && { notes }),
        },
        include: { items: { include: { product: true } } },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/purchase-orders/[id]
 */
export async function DELETE(_req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid purchase order ID' }, { status: 400 });
  }

  try {
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    await prisma.purchaseOrder.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true, message: 'Purchase order deleted', id: orderId });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
