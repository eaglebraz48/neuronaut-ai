import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAGa8_arWfKRBLff4bkOZP89FsDHYdQz2w",
  authDomain: "neuronaut-ai.firebaseapp.com",
  projectId: "neuronaut-ai",
  storageBucket: "neuronaut-ai.firebasestorage.app",
  messagingSenderId: "493925434963",
  appId: "1:493925434963:web:8044d3deeeb481dc5828a6",
};

// Safe singleton — prevents duplicate app init on hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Returns a Firebase Messaging instance safely.
 * Guards against: SSR, iPhone Safari < 16.4, private browsing, unsupported browsers.
 * NEVER throws — returns null so the app never crashes.
 */
export function getMessagingSafe(): Messaging | null {
  try {
    if (typeof window === "undefined") return null;
    if (!("Notification" in window)) return null;
    if (!("serviceWorker" in navigator)) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

// Legacy export — same safe logic, evaluated once at module load on client only
export const messaging: Messaging | null =
  typeof window !== "undefined"
    ? (() => {
        try {
          if (!("Notification" in window)) return null;
          if (!("serviceWorker" in navigator)) return null;
          return getMessaging(app);
        } catch {
          return null;
        }
      })()
    : null;