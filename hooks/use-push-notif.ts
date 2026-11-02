"use client";

import { saveSubscription } from "@/lib/notification";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotification = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const registerSW = async () => {
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        const existing = await registration.pushManager.getSubscription();

        if (existing) {
          setIsSubscribed(true);
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        // If permission is already granted, subscribe automatically
        if (Notification.permission === "granted") {
          const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });

          await saveSubscription(JSON.stringify(sub));
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error("[PushNotification] Registration error:", err);
      }
    };

    registerSW();
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window))
      return false;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn(
          "Cannot subscribe: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined",
        );
        return false;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await saveSubscription(JSON.stringify(sub));
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("[PushNotification] Subscription failed:", err);
      return false;
    }
  };

  return { isSubscribed, permission, subscribe };
};
