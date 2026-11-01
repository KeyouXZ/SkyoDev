'use server';

import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getUserFromSession } from '@/auth/core/session';

function initVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
    return true;
  }
  return false;
}

const NotificationPayloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().optional(),
  url: z.string().optional(),
  userId: z.string().optional(), // Optional: send to a specific user
});

type SubscriberRow = Prisma.SubscriberGetPayload<Record<string, never>>;

export async function sendPushNotifications(payload: string | z.infer<typeof NotificationPayloadSchema>) {
  const isConfigured = initVapid();
  if (!isConfigured) {
    return {
      success: false,
      error: 'VAPID keys not configured in environment variables',
    };
  }

  const raw = typeof payload === 'string' ? JSON.parse(payload) : payload;
  const parsed = NotificationPayloadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid notification payload',
      issues: parsed.error.issues,
    };
  }

  const { title, body, icon, url, userId } = parsed.data;

  // Fetch subscribers, optionally filtered by userId
  const subscribers = await prisma.subscriber.findMany({
    where: userId ? { userId } : undefined,
  });

  if (subscribers.length === 0) {
    return { success: false, error: 'No subscribers found' };
  }

  const failed: string[] = [];

  await Promise.all(
    subscribers.map(async (sub: SubscriberRow) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh },
          },
          JSON.stringify({
            title,
            body,
            icon: icon ?? '/favicon.ico',
            data: { url: url ?? '/dashboard' },
          })
        );
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          failed.push(sub.id);
        } else {
          console.error('❌ Failed to send notification to subscriber:', sub.id, err);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (failed.length > 0) {
    await prisma.subscriber.deleteMany({
      where: { id: { in: failed } },
    });
  }

  return {
    success: true,
    sent: subscribers.length - failed.length,
    failed: failed.length,
  };
}

const SubscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    auth: z.string().min(1),
    p256dh: z.string().min(1),
  }),
});

export async function saveSubscription(data: string) {
  const parsed = SubscriptionSchema.safeParse(JSON.parse(data));

  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid subscription payload',
      issues: parsed.error.issues,
    };
  }

  const { endpoint, keys } = parsed.data;

  try {
    const cookieStore = await cookies();
    const currentUser = await getUserFromSession(cookieStore);

    await prisma.subscriber.upsert({
      where: { endpoint },
      update: {
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: currentUser?.id ?? null,
      },
      create: {
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: currentUser?.id ?? null,
      },
    });

    return {
      success: true,
      message: 'Push subscription saved successfully',
    };
  } catch (err) {
    console.error('❌ Failed to save push subscription:', err);
    return {
      success: false,
      error: 'Database error',
    };
  }
}
