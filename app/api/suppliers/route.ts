import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(150),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/suppliers
 */
export async function GET() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/suppliers
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
    const result = CreateSupplierSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid supplier data", issues: result.error.issues },
        { status: 400 },
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
