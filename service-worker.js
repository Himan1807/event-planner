const CACHE_NAME = 'event-planner-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/Images/icon1-192.png',
    '/Images/icon1-512.png'
];

// Install: Cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                .filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim(); // Control all open clients right away
});

// Fetch: Serve cached content or fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
});