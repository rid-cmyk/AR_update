const CACHE_NAME = 'ar-hafalan-pwa-v2';
const STATIC_CACHE = 'ar-hafalan-static-v2';
const DATA_CACHE = 'ar-hafalan-data-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/quran.svg',
  '/m/offline'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Caching static PWA assets');
      await Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`[SW] Skip caching ${url}:`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore webpack HMR, Next.js dev server chunks, and non-http schemes
  if (
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('_next/static/development') ||
    url.protocol === 'chrome-extension:' ||
    (url.hostname === 'localhost' && url.pathname.startsWith('/_next/'))
  ) {
    return;
  }

  // 1. API Requests -> Network First, fallback to cache (for GET)
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const resClone = response.clone();
              caches.open(DATA_CACHE).then((cache) => cache.put(request, resClone));
            }
            return response;
          })
          .catch(async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: 'Offline mode', offline: true }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          })
      );
    }
    return;
  }

  // 2. Navigation Requests -> Network First, fallback to /m/offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offlinePage = await caches.match('/m/offline');
        if (offlinePage) return offlinePage;
        return new Response('Offline mode. Silakan periksa koneksi internet Anda.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );
    return;
  }

  // 3. Static assets & others -> Cache First, fallback to network with safety checks
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (
            request.method === 'GET' &&
            response &&
            response.status === 200 &&
            response.type === 'basic' &&
            !url.searchParams.has('_rsc') &&
            url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico|woff2?)$/)
          ) {
            const resClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, resClone));
          }
          return response;
        })
        .catch(() => {
          return new Response('', { status: 503, statusText: 'Service Unavailable (Offline)' });
        });
    })
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'AR-Hafalan', body: 'Notifikasi baru' };
  const title = data.title || 'AR-Hafalan';
  const options = {
    body: data.body || 'Ada pembaruan aktivitas hafalan.',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/m/guru/dashboard',
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/m/guru/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
