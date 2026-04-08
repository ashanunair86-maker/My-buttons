// My Buttons SW v14 — network-first for HTML, no stale cache
const CACHE='mb14';

self.addEventListener('install',e=>{
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
      .then(()=>clients.claim())
  );
});

// ALWAYS fetch index.html from network — never serve cached version
self.addEventListener('fetch',e=>{
  if(!e.request.url.startsWith('http'))return;
  const url=new URL(e.request.url);
  // Never cache HTML
  if(url.pathname.endsWith('.html')||url.pathname.endsWith('/')||url.pathname===''){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  // Cache other static assets
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res&&res.status===200){
        caches.open(CACHE).then(c=>c.put(e.request,res.clone())).catch(()=>{});
      }
      return res;
    }))
  );
});

// Handle notification actions
self.addEventListener('notificationclick',e=>{
  const notif=e.notification;
  notif.close();
  if(e.action==='snooze'){
    const data=notif.data||{};
    e.waitUntil(new Promise(resolve=>{
      setTimeout(()=>{
        self.registration.showNotification(notif.title,{
          body:notif.body,icon:notif.icon,badge:notif.badge,
          tag:(data.tag||'mb-snooze')+'-sn',
          vibrate:[300,100,300],requireInteraction:true,renotify:true,
          actions:[{action:'done',title:'✓ Done'},{action:'snooze',title:'⏰ 5 min'}],
          data:data
        });
        resolve();
      },5*60*1000);
    }));
    return;
  }
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(clist=>{
      for(const c of clist){
        if(c.url.includes('My-buttons')||c.url.includes('mybuttons')){
          c.focus();return;
        }
      }
      return clients.openWindow('./');
    })
  );
});
