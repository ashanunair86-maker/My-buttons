// ═══════════════════════════════════════════════════════
// MY BUTTONS — SERVICE WORKER v8
// ═══════════════════════════════════════════════════════
const CACHE = 'mybuttons-v8';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// ── INSTALL: cache core assets ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll(ASSETS).catch(() => {
        // if file:// protocol, skip asset caching silently
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: delete old caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: cache-first, fallback to network ──
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// ── PUSH NOTIFICATIONS (via showNotification) ──
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './icon-192.png',
      badge: './icon-192.png',
      tag: data.tag || 'mybuttons',
      data: { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) { list[0].focus(); return; }
      clients.openWindow('./');
    })
  );
});
