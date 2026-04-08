/// <reference lib="webworker" />

const CACHE_NAME = "vitrion-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const defaultData = {
    title: "🧬 Vitrion",
    body: "該補充今天的營養了！",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: "/" },
  };

  const payload = event.data ? event.data.json() : defaultData;

  event.waitUntil(
    self.registration.showNotification(payload.title || defaultData.title, {
      body: payload.body || defaultData.body,
      icon: payload.icon || defaultData.icon,
      badge: payload.badge || defaultData.badge,
      vibrate: [100, 50, 100],
      data: payload.data || defaultData.data,
      actions: [
        { action: "open", title: "開始打卡 ✅" },
        { action: "dismiss", title: "稍後提醒" },
      ],
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "dismiss") return;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if available
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          return existing.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});
