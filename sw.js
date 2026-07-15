const CACHE="qimam-portal-v15";
const ASSETS=["/","/index.html","/worker.html","/hr.html","/hrfinance.html","/closing.html","/sales.html","/operations.html","/employees.html","/manifest.webmanifest","/icon.svg"];

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;

  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      const url=new URL(req.url);
      const routePath=url.pathname.replace(/\/$/,"")||"/";const fallbackPath=routePath==="/"?"/index.html":(routePath.endsWith(".html")?routePath:routePath+".html");
      const cached=(await caches.match(req))||(await caches.match(fallbackPath))||(await caches.match("/index.html"));
      const network=fetch(req).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(req,copy));
        return response;
      }).catch(()=>cached);
      return cached||network;
    })());
    return;
  }

  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(req,copy));
    return response;
  })));
});
