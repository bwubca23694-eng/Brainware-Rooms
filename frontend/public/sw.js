/* BWU Rooms — Service Worker
   Handles: offline caching + push notifications */

const CACHE_NAME = 'bwu-rooms-v1';
const STATIC_ASSETS = [
  '/',
  '/rooms',
  '/login',
  '/register',
  '/static/js/main.chunk.js',
  '/static/css/main.chunk.css',
];

// ── INSTALL: cache static assets ──────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: network-first with cache fallback ──
self.addEventListener('fetch', e => {
  // Skip non-GET and API calls
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/')))
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  const options = {
    body: data.body || 'You have a new update from BWU Rooms',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'bwu-notification',
    renotify: true,
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };
  e.waitUntil(
    self.registration.showNotification(data.title || 'BWU Rooms 🏠', options)
  );
});

// ── NOTIFICATION CLICK: open relevant page ────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
