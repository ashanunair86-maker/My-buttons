// MY BUTTONS — SW v11 — NETWORK-FIRST — forces cache clear
const CACHE = 'mybuttons-v11';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./index.html','./manifest.json']).catch(()=>{}))
  );
});

self.addEventListener('activate', e => {
  // Delete ALL old caches including v10, v9, v8, mb8, mb9
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      console.log('Deleting cache:', k);
      return caches.delete(k);
    }))).then(() => caches.open(CACHE).then(c => 
      c.addAll(['./index.html','./manifest.json']).catch(()=>{})
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(r => {
        if(r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
    if(list.length){list[0].focus();return;}
    clients.openWindow('./');
  }));
});
