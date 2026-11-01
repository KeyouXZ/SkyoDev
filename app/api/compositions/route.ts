import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AddComponentSchema = z.object({
  parentProductId: z.number().int().positive('Parent product ID required'),
  componentProductId: z.number().int().positive('Component product ID required'),
  componentType: z.enum(['assembly', 'percentage']),
  quantity: z.number().positive('Quantity must be greater than 0'),
});

/**
 * GET /api/compositions
 * List Bill of Materials (BOM). Supports query: parentProductId
 */
export async function GET(req: Request) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parentProductId = searchParams.get('parentProductId')
    ? parseInt(searchParams.get('parentProductId')!, 10)
    : undefined;

  try {
    const compositions = await prisma.productComponent.findMany({
      where: {
        userId: user.id,
        ...(parentProductId && { parentProductId }),
      },
      include: {
        parentProduct: {
          select: { id: true, name: true, sku: true, stockLevel: true },
        },
        componentProduct: {
          select: { id: true, name: true, sku: true, stockLevel: true, price: true, cost: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(compositions);
  } catch (error) {
    console.error('Error fetching compositions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/compositions
 * Add a component to a parent product
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
    const result = AddComponentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid composition data', issues: result.error.issues }, { status: 400 });
    }

    const { parentProductId, componentProductId, componentType, quantity } = result.data;

    if (parentProductId === componentProductId) {
      return NextResponse.json({ error: 'Product cannot be a component of itself' }, { status: 400 });
    }

    // Verify both products belong to this user
    const [parent, component] = await Promise.all([
      prisma.product.findFirst({ where: { id: parentProductId, userId: user.id } }),
      prisma.product.findFirst({ where: { id: componentProductId, userId: user.id } }),
    ]);

    if (!parent || !component) {
      return NextResponse.json({ error: 'Parent or component product not found' }, { status: 404 });
    }

    const comp = await prisma.productComponent.upsert({
      where: {
        userId_parentProductId_componentProductId: {
          userId: user.id,
          parentProductId,
          componentProductId,
        },
      },
      update: {
        componentType,
        quantity,
      },
      create: {
        userId: user.id,
        parentProductId,
        componentProductId,
        componentType,
        quantity,
      },
      include: {
        parentProduct: { select: { id: true, name: true, sku: true } },
        componentProduct: { select: { id: true, name: true, sku: true } },
      },
    });

    return NextResponse.json(comp, { status: 201 });
  } catch (error) {
    console.error('Error saving composition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
