const CACHE_NAME = 'royal-4barg-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/game.js',
  '/renderer.js',
  '/engine.js',
  '/ui.js',
  '/audio.js',
  '/utils.js',
  '/constants.js',
  '/menu.js',
  '/bg3d.js',
  '/manifest.json',
  '/carpet_1.png',
  '/carpet_2.png',
  '/carpet_3.png',
  '/card_back_1.png',
  '/card_back_2.png',
  '/card_back_3.png',
  '/logo.png',
  '/asset_pause_icon.png',
  '/screenshot1.png',
  '/screenshot2.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});