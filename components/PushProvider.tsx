"use client";

import { usePushNotification } from "@/hooks/use-push-notif";
import type { ReactNode } from "react";

export function PushProvider({ children }: { children: ReactNode }) {
  usePushNotification();
  return <>{children}</>;
}
