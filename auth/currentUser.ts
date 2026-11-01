import { cookies } from 'next/headers';
import { getUserFromSession, UserSession } from './core/session';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getRoleNames, hasRole, hasAnyRole, RoleKey } from '@/types/roles';

export type FullUser = Exclude<
  Awaited<ReturnType<typeof getUserFromDb>>,
  undefined | null
> & {
  roles: RoleKey[];
  hasRole: (requiredRole: number) => boolean;
  hasAnyRole: (...roles: number[]) => boolean;
};

export type CurrentUser = UserSession & {
  roles: RoleKey[];
  hasRole: (requiredRole: number) => boolean;
  hasAnyRole: (...roles: number[]) => boolean;
};

function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound: true;
}): Promise<FullUser>;
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound?: false;
}): Promise<FullUser | null>;
function _getCurrentUser(options: {
  withFullUser?: false;
  redirectIfNotFound: true;
}): Promise<CurrentUser>;
function _getCurrentUser(options?: {
  withFullUser?: false;
  redirectIfNotFound?: false;
}): Promise<CurrentUser | null>;

async function _getCurrentUser({
  withFullUser = false,
  redirectIfNotFound = false,
}: {
  withFullUser?: boolean;
  redirectIfNotFound?: boolean;
} = {}): Promise<CurrentUser | FullUser | null> {
  const cookieStore = await cookies();
  const sessionUser = await getUserFromSession(cookieStore);

  if (!sessionUser) {
    if (redirectIfNotFound) {
      redirect('/login');
    }
    return null;
  }

  if (withFullUser) {
    const fullUser = await getUserFromDb(sessionUser.id);
    if (!fullUser) {
      if (redirectIfNotFound) {
        redirect('/login');
      }
      return null;
    }

    return {
      ...fullUser,
      roles: getRoleNames(fullUser.role),
      hasRole: (req: number) => hasRole(fullUser.role, req),
      hasAnyRole: (...roles: number[]) => hasAnyRole(fullUser.role, ...roles),
    };
  }

  return {
    ...sessionUser,
    roles: getRoleNames(sessionUser.role),
    hasRole: (req: number) => hasRole(sessionUser.role, req),
    hasAnyRole: (...roles: number[]) => hasAnyRole(sessionUser.role, ...roles),
  };
}

export const getCurrentUser = cache(_getCurrentUser);

function getUserFromDb(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      profileImageUrl: true,
      role: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
