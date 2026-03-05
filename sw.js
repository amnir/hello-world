// Bump version to force re-cache when files change
const CACHE_NAME = 'wisdom-defenders-v6';
const CORE_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/game.js',
    './js/sprites.js',
    './js/levels.js',
    './js/challenges.js',
    './js/audio.js',
    './js/assets.js',
    './js/game-logic.js',
    './js/tutorial.js',
    './manifest.json',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
];
const IMAGE_ASSETS = [
    './assets/defenders/number-buddy.png',
    './assets/defenders/letter-lion.png',
    './assets/defenders/color-flower.png',
    './assets/defenders/shape-shield.png',
    './assets/defenders/star-maker.png',
    './assets/defenders/pattern-peacock.png',
    './assets/defenders/music-bird.png',
    './assets/enemies/muddle-cloud.png',
    './assets/enemies/mess-monster.png',
    './assets/enemies/sleepy-snail.png',
    './assets/enemies/giggly-gremlin.png',
    './assets/enemies/bubble-trouble.png',
    './assets/enemies/king-chaos.png',
];

// Install: cache core assets (required), then best-effort cache images
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(CORE_ASSETS).then(() =>
                Promise.allSettled(IMAGE_ASSETS.map((url) => cache.add(url)))
            )
        )
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
