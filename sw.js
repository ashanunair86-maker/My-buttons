// My Buttons SW v12 — alarm-style, requireInteraction, snooze/done actions
const CACHE='mb12';const ASSETS=['./','./index.html','./manifest.json','./icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res&&res.status===200&&e.request.url.startsWith('https://')){
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});
      }
      return res;
    })).catch(()=>caches.match('./index.html'))
  );
});

// Handle notification click — Done or Snooze
self.addEventListener('notificationclick',e=>{
  const notif=e.notification;
  notif.close();

  if(e.action==='snooze'){
    // Snooze 5 minutes — re-fire notification
    const data=notif.data||{};
    e.waitUntil(new Promise(resolve=>{
      setTimeout(()=>{
        self.registration.showNotification(notif.title,{
          body:notif.body,
          icon:notif.icon,
          badge:notif.badge,
          tag:(data.tag||'mb-snooze')+'-sn',
          vibrate:[300,100,300,100,600],
          requireInteraction:true,
          renotify:true,
          actions:[
            {action:'done',title:'✓ Done'},
            {action:'snooze',title:'⏰ 5 min'}
          ],
          data:data
        });
        resolve();
      },5*60*1000);
    }));
    return;
  }

  // Done or default click — open/focus the app
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(clist=>{
      for(const c of clist){
        if(c.url.includes('My-buttons')||c.url.includes('mybuttons')||c.url.includes('index.html')){
          c.focus();
          return;
        }
      }
      return clients.openWindow('./');
    })
  );
});
