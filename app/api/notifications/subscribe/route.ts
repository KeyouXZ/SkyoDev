import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SubscribeSchema = z.object({
  endpoint: z.string().url("Invalid endpoint URL"),
  keys: z.object({
    auth: z.string().min(1, "Auth key required"),
    p256dh: z.string().min(1, "p256dh key required"),
  }),
});

const UnsubscribeSchema = z.object({
  endpoint: z.string().url("Invalid endpoint URL"),
});

/**
 * POST /api/notifications/subscribe
 * Register or update a Web Push subscription.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });

  try {
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const result = SubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid subscription data", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { endpoint, keys } = result.data;

    const subscriber = await prisma.subscriber.upsert({
      where: { endpoint },
      update: {
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: user?.id ?? null,
      },
      create: {
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: user?.id ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
      id: subscriber.id,
    });
  } catch (error) {
    console.error("Error in subscription endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Remove a Web Push subscription.
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = UnsubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid endpoint format" },
        { status: 400 },
      );
    }

    await prisma.subscriber.deleteMany({
      where: { endpoint: result.data.endpoint },
    });

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
