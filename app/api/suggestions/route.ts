import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';
import { sendPushNotifications } from '@/lib/notification';
import { z } from 'zod';

const CreateSuggestionSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
  suggestedQuantity: z.number().int().positive('Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(300),
});

/**
 * GET /api/suggestions
 * List reorder suggestions. Query options: status ('pending' | 'approved' | 'rejected')
 */
export async function GET(req: Request) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  try {
    const suggestions = await prisma.reorderSuggestion.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockLevel: true,
            reorderPoint: true,
            cost: true,
            price: true,
            supplier: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/suggestions
 * Manually or programmatically trigger a reorder suggestion.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const body = await req.json();
    const result = CreateSuggestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid suggestion data', issues: result.error.issues }, { status: 400 });
    }

    const { productId, suggestedQuantity, reason } = result.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const suggestion = await prisma.reorderSuggestion.create({
      data: {
        userId: user.id,
        productId,
        suggestedQuantity,
        reason,
        status: 'pending',
      },
      include: {
        product: true,
      },
    });

    // Notify user of new reorder suggestion
    await sendPushNotifications({
      title: `Reorder Suggestion: ${product.name}`,
      body: `Suggested to reorder ${suggestedQuantity} units. Reason: ${reason}`,
      url: '/suggestions',
      userId: user.id,
    }).catch((err) => console.error('Failed to send suggestion notification:', err));

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error('Error creating reorder suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
