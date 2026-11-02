import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/compositions/[id]
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
  const compId = parseInt(id, 10);
  if (isNaN(compId)) {
    return NextResponse.json(
      { error: "Invalid composition ID" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.productComponent.findFirst({
      where: { id: compId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Composition component not found" },
        { status: 404 },
      );
    }

    await prisma.productComponent.delete({
      where: { id: compId },
    });

    return NextResponse.json({
      success: true,
      message: "Component removed from composition",
      id: compId,
    });
  } catch (error) {
    console.error("Error removing composition component:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
