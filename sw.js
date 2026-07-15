const CACHE="qimam-portal-v16";
const ASSETS=["/","/index.html","/worker.html","/hr.html","/hrfinance.html","/closing.html","/sales.html","/operations.html","/employees.html","/manifest.webmanifest","/icon.svg"];

self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));

function canonicalPath(url){const p=url.pathname.replace(/\/$/,"")||"/";return p==="/"?"/index.html":(p.endsWith(".html")?p:p+".html")}
async function update(request,key){try{const response=await fetch(request,{cache:"no-store"});if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(key||request,response.clone())}return response}catch(error){return null}}
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET"||new URL(request.url).origin!==location.origin)return;if(request.mode==="navigate"){event.respondWith((async()=>{const key=canonicalPath(new URL(request.url));const cached=await caches.match(key)||await caches.match("/index.html");event.waitUntil(update(request,key));return cached||await update(request,key)||Response.error()})());return}event.respondWith((async()=>{const cached=await caches.match(request);const network=update(request,request);return cached||await network||Response.error()})())});
