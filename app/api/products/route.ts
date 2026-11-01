import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';
import { sendPushNotifications } from '@/lib/notification';
import { z } from 'zod';

const CreateProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().int().min(0, 'Price must be non-negative (in cents)'),
  cost: z.number().int().min(0, 'Cost must be non-negative (in cents)'),
  stockLevel: z.number().int().min(0, 'Stock level must be non-negative').default(0),
  reorderPoint: z.number().int().min(0, 'Reorder point must be non-negative').default(10),
  leadTimeDays: z.number().int().min(0, 'Lead time must be non-negative').default(7),
  supplierId: z.number().int().optional().nullable(),
});

/**
 * GET /api/products
 * Query options: search, category, lowStock, supplierId
 */
export async function GET(req: Request) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const lowStock = searchParams.get('lowStock') === 'true';
  const supplierId = searchParams.get('supplierId') ? parseInt(searchParams.get('supplierId')!, 10) : undefined;

  try {
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category }),
        ...(supplierId && { supplierId }),
      },
      include: {
        supplier: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: {
            sales: true,
            parentComponents: true,
            usedInComponents: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const filtered = lowStock
      ? products.filter((p) => p.stockLevel <= p.reorderPoint)
      : products;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create a new product. If stockLevel <= reorderPoint, dispatches low-stock notification.
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
    const result = CreateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid product data', issues: result.error.issues }, { status: 400 });
    }

    const data = result.data;

    // Check unique SKU for this user
    const existing = await prisma.product.findUnique({
      where: {
        userId_sku: {
          userId: user.id,
          sku: data.sku,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Product with SKU "${data.sku}" already exists` }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        userId: user.id,
      },
      include: {
        supplier: true,
      },
    });

    // Check low stock condition
    if (product.stockLevel <= product.reorderPoint) {
      await sendPushNotifications({
        title: `Low Stock Alert: ${product.name}`,
        body: `Item ${product.name} (${product.sku}) was created with stock ${product.stockLevel}, which is at or below the reorder point (${product.reorderPoint}).`,
        url: '/inventory',
        userId: user.id,
      }).catch((err) => console.error('Failed to send low stock notification:', err));
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
