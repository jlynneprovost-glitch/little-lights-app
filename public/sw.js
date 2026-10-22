/* Cache public shells/assets, never API/account data. Story JSON is saved by
   the reader separately and only when the server marks it isFree. */
const CACHE='little-lights-v2';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/stories','/stickers','/icons/icon-192.png','/icons/icon-512.png'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin')||url.pathname.startsWith('/auth/')||url.pathname==='/parent')return;
  const isAsset=url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/icons/');
  // Reader HTML has no story payload. Protected content uses uncached APIs.
  const isReaderShell=/^\/read\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url.pathname);
  const isSafePage=(['/','/stories','/stickers'].includes(url.pathname)||isReaderShell)&&!event.request.headers.get('RSC')&&!url.search;
  if(!isAsset&&!isSafePage)return;
  event.respondWith(fetch(event.request).then(async response=>{if(response.ok){const copy=response.clone();await caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(event.request).then(saved=>saved||new Response('You’re offline. Open a previously saved free story or reconnect for your next adventure.',{status:503,headers:{'Content-Type':'text/plain'}}))));
});
