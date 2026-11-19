// =============================================================
// SERVICE WORKER: o "ajudante" que deixa o Cristalia instalado no celular.
// Estratégia "rede primeiro":
//  - com internet: baixa sempre a versão mais nova do site (é assim que as
//    atualizações chegam) e guarda uma cópia;
//  - sem internet (ou rede muito lenta): usa a última cópia guardada.
// =============================================================
const CACHE = 'cristalia-v1';
const ESPERA_REDE = 4000; // ms: depois disso, se houver cópia guardada, usa ela

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardada = await cache.match(req, { ignoreSearch: true });
    const daRede = fetch(req, { cache: 'no-cache' }).then((resp) => {
      if (resp && (resp.ok || resp.type === 'opaque')) cache.put(req, resp.clone());
      return resp;
    });
    if (!guardada) return daRede;
    // corrida: a rede tem alguns segundos; se demorar, abre com a cópia guardada
    const tempo = new Promise((ok) => setTimeout(() => ok(guardada), ESPERA_REDE));
    try { return await Promise.race([daRede, tempo]); } catch { return guardada; }
  })());
});
