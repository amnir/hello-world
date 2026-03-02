// Bump version to force re-cache when files change
const CACHE_NAME = 'wisdom-defenders-v4';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/game.js',
    './js/sprites.js',
    './js/levels.js',
    './js/challenges.js',
    './js/audio.js',
    './manifest.json',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: stale-while-revalidate — serve from cache instantly, update in background
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
            cache.match(event.request).then((cached) => {
                const fetched = fetch(event.request).then((response) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
                return cached || fetched;
            })
        )
    );
});
