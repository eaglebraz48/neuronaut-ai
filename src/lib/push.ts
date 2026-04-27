import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getMessagingSafe } from "./firebase";
import type { NotificationKey } from "./notifications";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Checks whether this browser/device supports web push notifications.
 * Returns false silently for: SSR, iOS < 16.4, private browsing, unsupported browsers.
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("PushManager" in window)) return false;
  return true;
}

/**
 * Requests notification permission and returns the FCM token.
 *
 * IMPORTANT: This MUST be called from a user gesture (button tap).
 * Never call this on page load — iOS Safari will block it and crash.
 *
 * Returns null if:
 * - Browser doesn't support push (iPhone Safari < 16.4, etc.)
 * - User denies permission
 * - Any error occurs (never throws)
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // Guard 1: browser support check
  if (!isPushSupported()) {
    console.warn("Push notifications not supported on this device/browser");
    return null;
  }

  // Guard 2: VAPID key
  if (!VAPID_KEY) {
    console.error("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set");
    return null;
  }

  // Guard 3: get messaging safely
  const messagingInstance = getMessagingSafe();
  if (!messagingInstance) {
    console.warn("Firebase messaging unavailable");
    return null;
  }

  try {
    // Guard 4: request permission — must be from user gesture on iOS
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission:", permission);
      return null;
    }

    // Guard 5: register service worker safely
    let swReg: ServiceWorkerRegistration | undefined;
    try {
      swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
    } catch (swErr) {
      console.error("Service worker registration failed:", swErr);
      return null;
    }

    // Guard 6: get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.warn("No FCM token — check VAPID key and service worker");
      return null;
    }

    return token;
  } catch (error) {
    // Never let this crash the app
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Sends a localized push notification via your API route.
 */
export async function sendPushNotification(
  token: string,
  userId: string,
  notificationKey: NotificationKey,
  overrides?: { title?: string; body?: string }
): Promise<boolean> {
  try {
    const res = await fetch("/api/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        userId,
        notificationKey,
        titleOverride: overrides?.title,
        bodyOverride: overrides?.body,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      console.error("Push notification failed:", data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

/**
 * Listen for foreground messages (app open and in focus).
 * Background messages are handled by the service worker.
 * Returns unsubscribe function or null if unavailable.
 */
export function onForegroundMessage(
  callback: (payload: MessagePayload) => void
): (() => void) | null {
  const messagingInstance = getMessagingSafe();
  if (!messagingInstance) return null;

  try {
    return onMessage(messagingInstance, (payload) => {
      console.log("[Foreground] Message received:", payload);
      callback(payload);
    });
  } catch {
    return null;
  }
}