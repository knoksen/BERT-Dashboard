const CACHE_NAME = 'ai-tool-suite-static-v1';
const DYNAMIC_CACHE_NAME = 'ai-tool-suite-dynamic-v1';

// App shell files to cache on install
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://esm.sh/@google/genai@^1.11.0'
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened static cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('ai-tool-suite-') && cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Don't cache Gemini API requests
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If the request is in the cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // If the request is not in the cache, fetch it from the network
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            if(event.request.method === 'GET') {
                 cache.put(event.request, responseToCache);
            }
        });

        return networkResponse;
      });
    })
  );
});