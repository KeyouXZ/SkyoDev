import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { UserSessionData } from "@/types/User";

// Seven days in seconds
export const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
export const COOKIE_SESSION_KEY = "session-id";

export const sessionSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: z.number().int(), // Bitwise integer
  name: z.string().nullish(),
  profileImageUrl: z.string().nullish(),
});

export type UserSession = z.infer<typeof sessionSchema>;

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number | Date;
      maxAge?: number;
      path?: string;
    },
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

/**
 * Retrieve user from current request session cookie via PostgreSQL
 */
export async function getUserFromSession(
  cookies: Pick<Cookies, "get">,
): Promise<UserSession | null> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return null;

  return getUserSessionById(sessionId);
}

/**
 * Update user session in PostgreSQL
 */
export async function updateUserSessionData(
  user: UserSessionData,
  cookies: Pick<Cookies, "get">,
): Promise<UserSession | null> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return null;

  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000);

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      role: user.role,
      data: {
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
      expiresAt,
    },
    include: { user: true },
  });

  return {
    id: updated.user.id,
    email: updated.user.email,
    role: updated.role,
    name: updated.user.name,
    profileImageUrl: updated.user.profileImageUrl,
  };
}

/**
 * Create a new session in PostgreSQL and set the session cookie
 */
export async function createUserSession(
  user: UserSessionData,
  cookies: Pick<Cookies, "set">,
): Promise<string> {
  const sessionId = globalThis.crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      role: user.role,
      data: {
        email: user.email,
        name: user.name ?? null,
        profileImageUrl: user.profileImageUrl ?? null,
      },
      expiresAt,
    },
  });

  setCookie(sessionId, cookies);
  return sessionId;
}

/**
 * Extend session expiration in PostgreSQL and update cookie
 */
export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">,
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;

  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000);

  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
    setCookie(sessionId, cookies);
  } catch (error) {
    console.error("Failed to update session expiration:", error);
  }
}

/**
 * Delete session from PostgreSQL and clear cookie
 */
export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">,
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId) {
    try {
      await prisma.session.deleteMany({
        where: { id: sessionId },
      });
    } catch (error) {
      console.error("Failed to delete session from database:", error);
    }
  }

  cookies.delete(COOKIE_SESSION_KEY);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

/**
 * Lookup session in PostgreSQL and verify expiration
 */
export async function getUserSessionById(
  sessionId: string,
): Promise<UserSession | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            profileImageUrl: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Async cleanup expired session
      prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.role ?? session.user.role,
      name: session.user.name,
      profileImageUrl: session.user.profileImageUrl,
    };
  } catch (error) {
    console.error("Error fetching session from PostgreSQL:", error);
    return null;
  }
}
