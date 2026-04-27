// /public/firebase-messaging-sw.js
// Handles background push notifications when the app is not in focus.
// Works for: Android Chrome, desktop Chrome/Firefox, iOS Safari 16.4+ (PWA only)

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAGa8_arWfKRBLff4bkOZP89FsDHYdQz2w",
  authDomain: "neuronaut-ai.firebaseapp.com",
  projectId: "neuronaut-ai",
  storageBucket: "neuronaut-ai.firebasestorage.app",
  messagingSenderId: "493925434963",
  appId: "1:493925434963:web:8044d3deeeb481dc5828a6",
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  const notification = payload.notification ?? {};
  const data = payload.data ?? {};

  self.registration.showNotification(notification.title ?? "Neuronaut", {
    body: notification.body ?? "",
    icon: notification.icon ?? "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    lang: data.lang ?? "en",
    vibrate: [200, 100, 200],
    data: {
      url: data.url ?? "/",
      ...data,
    },
  });
});

// Open or focus app when notification is tapped
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});