// Service Worker Cache Strategy for Mobile Performance

const CACHE_NAME = 'zayiflamaplanim-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';

// Cache-first stratejisi için statik dosyalar
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
];

// Network-first stratejisi için API endpoints
const API_ROUTES = [
  '/api/groups',
  '/api/notifications',
  '/api/profile',
];

// Image cache stratejisi
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Install event - statik dosyaları cache'le
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache stratejileri
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API istekleri için Network-first
  if (API_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Resimler için Cache-first
  if (IMAGE_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Diğer istekler için Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first stratejisi
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Cache-first stratejisi
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response('Image not available', { status: 404 });
  }
}

// Stale-while-revalidate stratejisi
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(RUNTIME_CACHE);
    cache.then((c) => c.put(request, response.clone()));
    return response;
  });

  return cached || fetchPromise;
}

// Background sync için
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Offline mesajları senkronize et
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.url.includes('/api/groups/') && request.method === 'POST') {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
