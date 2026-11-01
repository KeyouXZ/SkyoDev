import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/scanner?sku=...
 * Rapid barcode / SKU scanner lookup
 */
export async function GET(req: Request) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sku = searchParams.get('sku')?.trim();

  if (!sku) {
    return NextResponse.json({ error: 'SKU query parameter is required' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        userId_sku: {
          userId: user.id,
          sku,
        },
      },
      include: {
        supplier: {
          select: { id: true, name: true, phone: true },
        },
        reorderSuggestions: {
          where: { status: 'pending' },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: `Product with SKU "${sku}" not found` }, { status: 404 });
    }

    const isLowStock = product.stockLevel <= product.reorderPoint;

    return NextResponse.json({
      product,
      isLowStock,
      hasPendingSuggestion: product.reorderSuggestions.length > 0,
    });
  } catch (error) {
    console.error('Error scanning product SKU:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
