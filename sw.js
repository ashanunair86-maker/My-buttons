// MY BUTTONS — SW v10 — NETWORK-FIRST
const CACHE = 'mybuttons-v10';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./index.html','./manifest.json']).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
    .then(()=>caches.open(CACHE).then(c=>c.addAll(['./index.html','./manifest.json']).catch(()=>{})))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request,{cache:'no-cache'})
      .then(r=>{
        if(r&&r.status===200){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
        return r;
      })
      .catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html')))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    if(list.length){list[0].focus();return;}
    clients.openWindow('./');
  }));
});
