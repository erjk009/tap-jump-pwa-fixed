self.addEventListener('install', event => {
  event.waitUntil(caches.open('tap-jump-v1').then(cache => {
    return cache.addAll(['./','./index.html','./style.css','./game.js','./assets/bg-720x1280.png','./assets/player.png','./assets/icon-192.png','./manifest.json']);
  }));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => {
    return resp || fetch(event.request);
  }));
});
