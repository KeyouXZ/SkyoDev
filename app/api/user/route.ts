import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  firstName: z.string().max(50).optional().nullable(),
  lastName: z.string().max(50).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  profileImageUrl: z.string().url().max(500).optional().nullable(),
});

/**
 * GET /api/user
 * Returns the current user's profile (without password).
 */
export async function GET() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      profileImageUrl: true,
      phoneNumber: true,
      createdAt: true,
    },
  });
  if (!full) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(full);
}

/**
 * PATCH /api/user
 * Updates the current user's profile fields.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const result = UpdateUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: result.error.issues },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: result.data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      profileImageUrl: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
