import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth/currentUser';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateSupplierSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/suppliers/[id]
 */
export async function GET(_req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supplierId = parseInt(id, 10);
  if (isNaN(supplierId)) {
    return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
  }

  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, userId: user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            cost: true,
            stockLevel: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/suppliers/[id]
 */
export async function PUT(req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supplierId = parseInt(id, 10);
  if (isNaN(supplierId)) {
    return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = UpdateSupplierSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid supplier update', issues: result.error.issues }, { status: 400 });
    }

    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/suppliers/[id]
 */
export async function DELETE(_req: Request, { params }: Context) {
  const user = await getCurrentUser({ withFullUser: false, redirectIfNotFound: false });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supplierId = parseInt(id, 10);
  if (isNaN(supplierId)) {
    return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
  }

  try {
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully', id: supplierId });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
