const CACHE = 'id-detect-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.map(k=> k===CACHE?null:caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy));
        return res;
      }).catch(()=> caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy));
        return res;
      }).catch(()=> caches.match(req))
    );
  }
});
