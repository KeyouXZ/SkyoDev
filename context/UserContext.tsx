"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { CurrentUser } from "@/auth/currentUser";
import {
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
} from "@/types/roles";

export interface UserContextUser extends CurrentUser {
  hasRole: (requiredRole: number) => boolean;
  hasAnyRole: (...roles: number[]) => boolean;
}

const UserContext = createContext<UserContextUser | null>(null);

export function useUser(): UserContextUser {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
}

export function UserProvider({
  value,
  children,
}: {
  value: CurrentUser;
  children: ReactNode;
}) {
  const contextValue = useMemo<UserContextUser>(
    () => ({
      ...value,
      hasRole: (requiredRole: number) => checkRole(value.role, requiredRole),
      hasAnyRole: (...roles: number[]) => checkAnyRole(value.role, ...roles),
    }),
    [value],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
