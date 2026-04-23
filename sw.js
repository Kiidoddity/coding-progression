const CACHE_NAME = 'coding-mastery-v1';
const STATIC_ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET')return;
  if(e.request.url.includes('fonts.googleapis.com')||e.request.url.includes('fonts.gstatic.com')||e.request.url.includes('cdnjs.cloudflare.com'))return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){const c=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));
});
