const CACHE_NAME = 'emotitunes-cache-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/vite.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('EmotiTunes ServiceWorker: Caching core shell');
            return cache.addAll(assetsToCache);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    // Ignore API calls and hot reloads
    const url = new URL(event.request.url);
    if (url.pathname.includes('/api/') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            
            // For external assets like CDNs, we fetch on demand
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }

                // Only cache successful basic responses to avoid CORS/opaque issues in bulk
                if (networkResponse.type === 'basic' || (url.hostname.includes('cdn') || url.hostname.includes('google'))) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return networkResponse;
            }).catch(() => {
                // Return offline fallback if needed
            });
        })
    );
});
